import "../src/styles/theme.css";
import "./styles.css";
import { select } from "d3-selection";

import {
  chartInventory,
  chartInventorySummary,
  repeatedPrimitives,
} from "../src/audit";
import { create, defineChart, grid, registerChart } from "../src/charts";
import {
  createAxis,
  createBandScale,
  createLinearScale,
  getSeriesColour,
} from "../src/core";
import type {
  BaseChartConfig,
  ChartRenderContext,
  ChartDefinition,
  ConditionalConfigContext,
  GridConfigInput,
  NormalizedDataRow,
  RootSelection,
} from "../src/types";

type FilterKey = "all" | "bespoke" | "shared" | "standalone";
type DemoRow = {
  period: string;
  region: string;
  employment: number;
  unemployment: number;
  vacancies: number;
};

const app = document.querySelector<HTMLDivElement>("#app");

if (app === null) {
  throw new Error("Playground root element not found.");
}

const summaryCards = [
  { label: "Chart directories", value: chartInventorySummary.totalCharts },
  { label: "Using shared helpers", value: chartInventorySummary.usingSharedHelpers },
  { label: "Standalone explorers", value: chartInventorySummary.standaloneCharts },
  { label: "Bespoke geometry", value: chartInventorySummary.bespokeCharts },
];

const demoRows: readonly DemoRow[] = [
  { period: "Q1", region: "North", employment: 67, unemployment: 8, vacancies: 5 },
  { period: "Q2", region: "North", employment: 68, unemployment: 8, vacancies: 6 },
  { period: "Q3", region: "North", employment: 69, unemployment: 7, vacancies: 6 },
  { period: "Q4", region: "North", employment: 70, unemployment: 7, vacancies: 7 },
  { period: "Q1", region: "Midlands", employment: 64, unemployment: 9, vacancies: 4 },
  { period: "Q2", region: "Midlands", employment: 65, unemployment: 9, vacancies: 4 },
  { period: "Q3", region: "Midlands", employment: 66, unemployment: 8, vacancies: 5 },
  { period: "Q4", region: "Midlands", employment: 67, unemployment: 8, vacancies: 5 },
  { period: "Q1", region: "South", employment: 72, unemployment: 5, vacancies: 7 },
  { period: "Q2", region: "South", employment: 73, unemployment: 5, vacancies: 8 },
  { period: "Q3", region: "South", employment: 74, unemployment: 4, vacancies: 9 },
  { period: "Q4", region: "South", employment: 75, unemployment: 4, vacancies: 10 },
];

function getSeriesValue(row: NormalizedDataRow, key: string): number | undefined {
  const rawValue = row[key];

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue;
  }

  if (typeof rawValue === "string" && rawValue.trim() !== "" && Number.isFinite(Number(rawValue))) {
    return Number(rawValue);
  }

  return undefined;
}

function buildPath(points: readonly { x: number; y: number }[]): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
}

const demoLineDefinition: ChartDefinition = defineChart({
  displayName: "Demo line chart",
  id: "demo-line",
  render(context) {
    const xKey = "period";
    const activeSeries = context.config.series;
    const rows = context.data.rows;
    const categories = Array.from(
      new Set(rows.map((row) => String(row[xKey] ?? ""))),
    );
    const xScale = createBandScale({
      domain: categories,
      range: [0, context.frame.innerWidth],
    });
    const values = activeSeries.flatMap((series) =>
      rows
        .map((row) => getSeriesValue(row, series.valueKey ?? series.yKey ?? series.id))
        .filter((value): value is number => value !== undefined),
    );
    const yScale = createLinearScale({
      range: [context.frame.innerHeight, 0],
      values,
    });
    const axesLayer = select(context.dom.layers.grid);
    const plotLayer = select(context.dom.layers.plot);

    axesLayer.selectAll("*").remove();

    if (context.config.axes.x?.visible !== false) {
      axesLayer
        .append("g")
        .attr("class", "demo-axis demo-axis--x")
        .attr("transform", `translate(0, ${context.frame.innerHeight})`)
        .call(createAxis({ orientation: "bottom", scale: xScale }));
    }

    if (context.config.axes.y?.visible !== false) {
      axesLayer
        .append("g")
        .attr("class", "demo-axis demo-axis--y")
        .call(createAxis({ orientation: "left", scale: yScale, ticks: 5 }));
    }

    const lineGroups = plotLayer
      .selectAll<SVGGElement, (typeof activeSeries)[number]>("g.demo-line-series")
      .data(activeSeries, (series) => series.id)
      .join("g")
      .attr("class", "demo-line-series");

    lineGroups.each(function renderSeries(series, index) {
      const valueKey = series.valueKey ?? series.yKey ?? series.id;
      const points = rows
        .map((row) => {
          const value = getSeriesValue(row, valueKey);
          const xValue = String(row[xKey] ?? "");

          if (value === undefined || !categories.includes(xValue)) {
            return undefined;
          }

          const bandOffset = xScale.bandwidth() / 2;
          const x = (xScale(xValue) ?? 0) + bandOffset;

          return {
            row,
            value,
            x,
            xValue,
            y: yScale(value),
          };
        })
        .filter((point): point is NonNullable<typeof point> => point !== undefined);
      const group = select(this);
      const seriesColour = series.style?.stroke ?? getSeriesColour(index, context.config.colourPalette, context.theme);

      group
        .selectAll<SVGPathElement, typeof points>("path.demo-line")
        .data([points])
        .join("path")
        .attr("class", "demo-line")
        .attr("fill", "none")
        .attr("stroke", seriesColour)
        .attr("stroke-width", Number(series.style?.strokeWidth ?? 2))
        .attr("stroke-dasharray", series.style?.strokeDasharray ?? null)
        .attr("d", (linePoints) => buildPath(linePoints));

      group
        .selectAll<SVGCircleElement, (typeof points)[number]>("circle.demo-point")
        .data(points, (point) => `${series.id}:${point.row.__rowId}`)
        .join("circle")
        .attr("class", "demo-point")
        .attr("cx", (point) => point.x)
        .attr("cy", (point) => point.y)
        .attr("r", 4)
        .attr("fill", seriesColour)
        .attr("data-ons-charts-link-key", (point) => point.xValue)
        .attr(
          "data-ons-charts-tooltip",
          (point) =>
            `${String(series.label ?? series.id)} · ${point.xValue}: ${point.value}`,
        );
    });

    context.setPluginState("scales", { x: xScale, y: yScale });
  },
});

const demoBarDefinition: ChartDefinition = defineChart({
  displayName: "Demo grouped bar chart",
  id: "demo-bar",
  render(context) {
    const xKey = "period";
    const activeSeries = context.config.series;
    const rows = context.data.rows;
    const categories = Array.from(
      new Set(rows.map((row) => String(row[xKey] ?? ""))),
    );
    const seriesIds = activeSeries.map((series) => series.id);
    const xScale = createBandScale({
      domain: categories,
      range: [0, context.frame.innerWidth],
      paddingInner: 0.2,
    });
    const groupedScale = createBandScale({
      domain: seriesIds,
      range: [0, xScale.bandwidth()],
      paddingInner: 0.1,
    });
    const values = activeSeries.flatMap((series) =>
      rows
        .map((row) => getSeriesValue(row, series.valueKey ?? series.yKey ?? series.id))
        .filter((value): value is number => value !== undefined),
    );
    const yScale = createLinearScale({
      range: [context.frame.innerHeight, 0],
      values,
    });
    const axesLayer = select(context.dom.layers.grid);
    const plotLayer = select(context.dom.layers.plot);

    axesLayer.selectAll("*").remove();

    if (context.config.axes.x?.visible !== false) {
      axesLayer
        .append("g")
        .attr("class", "demo-axis demo-axis--x")
        .attr("transform", `translate(0, ${context.frame.innerHeight})`)
        .call(createAxis({ orientation: "bottom", scale: xScale }));
    }

    if (context.config.axes.y?.visible !== false) {
      axesLayer
        .append("g")
        .attr("class", "demo-axis demo-axis--y")
        .call(createAxis({ orientation: "left", scale: yScale, ticks: 5 }));
    }

    const barData = rows.flatMap((row) => {
      const xValue = String(row[xKey] ?? "");

      return activeSeries
        .map((series, index) => {
          const value = getSeriesValue(row, series.valueKey ?? series.yKey ?? series.id);

          if (value === undefined) {
            return undefined;
          }

          return {
            colour: series.style?.fill ?? getSeriesColour(index, context.config.colourPalette, context.theme),
            row,
            series,
            value,
            xValue,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
    });

    plotLayer
      .selectAll<SVGRectElement, (typeof barData)[number]>("rect.demo-bar")
      .data(barData, (datum) => `${datum.series.id}:${datum.row.__rowId}`)
      .join("rect")
      .attr("class", "demo-bar")
      .attr("x", (datum) => (xScale(datum.xValue) ?? 0) + (groupedScale(datum.series.id) ?? 0))
      .attr("y", (datum) => yScale(Math.max(0, datum.value)))
      .attr("width", groupedScale.bandwidth())
      .attr("height", (datum) => Math.abs(yScale(datum.value) - yScale(0)))
      .attr("fill", (datum) => datum.colour)
      .attr("data-ons-charts-link-key", (datum) => datum.xValue)
      .attr(
        "data-ons-charts-tooltip",
        (datum) =>
          `${String(datum.series.label ?? datum.series.id)} · ${datum.xValue}: ${datum.value}`,
      );

    context.setPluginState("scales", { x: xScale, y: yScale });
  },
});

app.innerHTML = `
  <main class="playground">
    <header class="playground__hero">
      <p class="playground__eyebrow">Phase 1 foundations</p>
      <h1>ONS Charts development playground</h1>
      <p class="playground__lede">
        This Vite harness renders every current chart in isolation while the modular
        library scaffold is being built around the existing templates.
      </p>
      <div class="playground__summary">
        ${summaryCards
          .map(
            (card) => `
              <article class="summary-card">
                <strong>${card.value}</strong>
                <span>${card.label}</span>
              </article>
            `,
          )
          .join("")}
      </div>
    </header>

    <section class="playground__panel">
      <div class="playground__panel-header">
        <div>
          <h2>Modular runtime demos</h2>
          <p>These charts are rendered by the new runtime (create / grid) and custom chart definitions.</p>
        </div>
      </div>
      <div class="modular-demo-grid">
        <article class="modular-demo-card">
          <h3>Interactive line chart</h3>
          <p>Uses controls + tooltip + annotation plugin.</p>
          <div class="modular-demo-card__mount" id="modular-demo-line"></div>
        </article>
        <article class="modular-demo-card">
          <h3>Grouped bar chart</h3>
          <p>Same data contract with a different renderer.</p>
          <div class="modular-demo-card__mount" id="modular-demo-bar"></div>
        </article>
        <article class="modular-demo-card">
          <h3>Override hook demo</h3>
          <p>Uses <code>overrides.postRender</code> to add custom styling after render.</p>
          <div class="modular-demo-card__mount" id="modular-demo-overrides"></div>
        </article>
        <article class="modular-demo-card modular-demo-card--wide">
          <h3>Small multiples grid</h3>
          <p>Uses <code>grid(...)</code> with facet context and linked tooltip keys.</p>
          <div class="modular-demo-card__mount" id="modular-demo-grid"></div>
        </article>
      </div>
      <p class="modular-demo-error" id="modular-demo-error" hidden></p>
    </section>

    <section class="playground__panel">
      <div class="playground__panel-header">
        <div>
          <h2>Shared primitive audit</h2>
          <p>The first extraction targets for the modular library.</p>
        </div>
      </div>
      <div class="primitive-grid">
        ${repeatedPrimitives
          .map(
            (primitive) => `
              <article class="primitive-card">
                <h3>${primitive.name}</h3>
                <p>${primitive.description}</p>
                <code>${primitive.evidence.join(" · ")}</code>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="playground__panel">
      <div class="playground__panel-header">
        <div>
          <h2>Chart inventory</h2>
          <p>Use the filters to focus on bespoke or shared-core templates.</p>
        </div>
        <div class="playground__filters" role="group" aria-label="Chart filters">
          <button class="filter-button is-active" data-filter="all" type="button">All</button>
          <button class="filter-button" data-filter="shared" type="button">Shared helpers</button>
          <button class="filter-button" data-filter="bespoke" type="button">Bespoke geometry</button>
          <button class="filter-button" data-filter="standalone" type="button">Standalone</button>
        </div>
      </div>
      <div class="chart-grid" data-gallery></div>
    </section>
  </main>
`;

const gallery = app.querySelector<HTMLDivElement>("[data-gallery]");
const filterButtons = Array.from(
  app.querySelectorAll<HTMLButtonElement>("[data-filter]"),
);

if (gallery === null) {
  throw new Error("Playground gallery element not found.");
}

const galleryElement = gallery;

function matchesFilter(filter: FilterKey) {
  return (chart: (typeof chartInventory)[number]): boolean => {
    if (filter === "all") return true;
    if (filter === "bespoke") return chart.bespokeGeometry;
    if (filter === "standalone") return !chart.usesSharedHelpers;
    return chart.usesSharedHelpers;
  };
}

function renderGallery(filter: FilterKey): void {
  galleryElement.innerHTML = "";

  chartInventory
    .filter(matchesFilter(filter))
    .forEach((chart) => {
      const card = document.createElement("article");
      card.className = "chart-card";

      if (chart.bespokeGeometry) {
        card.classList.add("chart-card--bespoke");
      }

      if (!chart.usesSharedHelpers) {
        card.classList.add("chart-card--standalone");
      }

      card.innerHTML = `
        <header class="chart-card__header">
          <div>
            <h3>${chart.name}</h3>
            <p>${chart.family} template</p>
          </div>
          <div class="chart-card__badges">
            <span class="badge ${chart.usesSharedHelpers ? "badge--good" : "badge--muted"}">
              ${chart.usesSharedHelpers ? "helpers.js" : "standalone"}
            </span>
            ${
              chart.bespokeGeometry
                ? '<span class="badge badge--warn">bespoke</span>'
                : ""
            }
            ${
              chart.usesAnnotations
                ? '<span class="badge badge--accent">annotations</span>'
                : ""
            }
          </div>
        </header>
        ${
          chart.notes !== undefined
            ? `<p class="chart-card__notes">${chart.notes}</p>`
            : ""
        }
        <div class="chart-card__actions">
          <a href="${chart.path}" target="_blank" rel="noreferrer">Open chart</a>
        </div>
      `;

      const frame = document.createElement("iframe");
      frame.className = "chart-card__frame";
      frame.loading = "lazy";
      frame.src = chart.path;
      frame.title = chart.name;

      card.append(frame);
      galleryElement.append(card);
    });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextFilter = button.dataset.filter as FilterKey;

    filterButtons.forEach((candidate) =>
      candidate.classList.toggle("is-active", candidate === button),
    );

    renderGallery(nextFilter);
  });
});

renderGallery("all");

async function renderModularDemos(): Promise<void> {
  const lineContainer = document.querySelector<HTMLElement>("#modular-demo-line");
  const barContainer = document.querySelector<HTMLElement>("#modular-demo-bar");
  const overrideContainer = document.querySelector<HTMLElement>("#modular-demo-overrides");
  const gridContainer = document.querySelector<HTMLElement>("#modular-demo-grid");
  const errorElement = document.querySelector<HTMLElement>("#modular-demo-error");

  if (
    lineContainer === null ||
    barContainer === null ||
    overrideContainer === null ||
    gridContainer === null ||
    errorElement === null
  ) {
    return;
  }

  registerChart([demoLineDefinition, demoBarDefinition]);

  const sharedSeries = [
    { id: "employment", label: "Employment", valueKey: "employment" },
    { id: "unemployment", label: "Unemployment", valueKey: "unemployment" },
    { id: "vacancies", label: "Vacancies", valueKey: "vacancies" },
  ] as const;

  try {
    const instances = await Promise.all([
      create(lineContainer, {
        accessibility: {
          ariaLabel: "Line chart showing labour market metrics by quarter",
          table: {
            caption: "Labour market metrics",
            hideAt: ["sm"],
          },
        },
        annotations: [
          {
            axis: "y",
            id: "line-target",
            label: "Target 70",
            style: {
              stroke: "#206095",
              strokeDasharray: "4 2",
              strokeWidth: 2,
            },
            type: "line",
            value: 70,
          },
        ],
        axes: {
          x: { visible: true },
          y: { visible: true },
        },
        controls: [
          {
            action: "filter",
            defaultValue: "North",
            field: "region",
            id: "region-filter",
            label: "Region",
            options: [
              { label: "North", value: "North" },
              { label: "Midlands", value: "Midlands" },
              { label: "South", value: "South" },
            ],
            position: "top",
            type: "dropdown",
          },
          {
            action: "series-toggle",
            defaultValue: ["employment", "unemployment"],
            id: "series-toggle",
            label: "Visible series",
            multiple: true,
            options: [
              { label: "Employment", value: "employment" },
              { label: "Unemployment", value: "unemployment" },
              { label: "Vacancies", value: "vacancies" },
            ],
            position: "bottom",
            type: "button-group",
          },
        ],
        data: { source: demoRows },
        plugins: ["tooltip", "annotation"],
        series: sharedSeries,
        type: "demo-line",
      }),
      create(barContainer, {
        accessibility: {
          ariaLabel: "Grouped bar chart showing labour market metrics by quarter for the North",
        },
        axes: {
          x: { visible: true },
          y: { visible: true },
        },
        data: { source: demoRows.filter((row) => row.region === "North") },
        plugins: ["tooltip"],
        series: sharedSeries,
        type: "demo-bar",
      }),
      create(overrideContainer, {
        accessibility: {
          ariaLabel: "Override demo chart showing employment and unemployment by quarter for the South",
        },
        axes: {
          x: { visible: true },
          y: { visible: true },
        },
        data: { source: demoRows.filter((row) => row.region === "South") },
        overrides: {
          postRender: (
            selection: RootSelection,
            context: ChartRenderContext<BaseChartConfig>,
          ) => {
            const points = selection.selectAll<SVGCircleElement, unknown>("circle.demo-point");
            const latestPoint = points.filter((_: unknown, index: number, nodes: ArrayLike<SVGCircleElement>) =>
              index === nodes.length - 1,
            );

            points.attr("opacity", 0.4);
            latestPoint
              .attr("opacity", 1)
              .attr("r", 7)
              .attr("stroke", "#222")
              .attr("stroke-width", 2);

            select(context.dom.layers.overlay)
              .selectAll<SVGTextElement, string>("text.demo-override-note")
              .data(["Override hook: latest point emphasised"])
              .join("text")
              .attr("class", "demo-override-note")
              .attr("x", context.frame.innerWidth)
              .attr("y", 14)
              .attr("text-anchor", "end")
              .attr("fill", context.theme.colors.textMuted)
              .attr("font-size", context.theme.typography.sizes.small)
              .text((value) => value);
          },
        },
        plugins: ["tooltip"],
        series: [
          { id: "employment", label: "Employment", valueKey: "employment" },
          { id: "unemployment", label: "Unemployment", valueKey: "unemployment" },
        ],
        type: "demo-line",
      }),
      grid(
        gridContainer,
        {
          accessibility: {
            ariaLabel: "Small multiples line charts by region",
          },
          axes: {
            x: { visible: (context: ConditionalConfigContext) => context.isLastInRow },
            y: { visible: (context: ConditionalConfigContext) => context.isFirstInRow },
          },
          data: { source: demoRows },
          facet: {
            columns: {
              lg: 3,
              md: 2,
              sm: 1,
            },
            field: "region",
          },
          linked: true,
          plugins: ["tooltip"],
          series: [{ id: "employment", label: "Employment", valueKey: "employment" }],
          type: "demo-line",
        } as unknown as GridConfigInput,
      ),
    ]);

    (window as Window & { onsChartsDemos?: unknown }).onsChartsDemos = {
      bar: instances[1],
      grid: instances[3],
      line: instances[0],
      overrides: instances[2],
    };
  } catch (error) {
    errorElement.hidden = false;
    errorElement.textContent = `Failed to render modular demos: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void renderModularDemos();
