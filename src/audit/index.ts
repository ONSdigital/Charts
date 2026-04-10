import type {
  ChartInventoryEntry,
  ResponsiveVariantEntry,
  SharedPrimitiveSummary,
} from "../types";

function inferFamily(id: string): string {
  if (id.startsWith("bar-chart")) return "bar";
  if (id.startsWith("line-chart")) return "line";
  if (id.startsWith("column-chart")) return "column";
  if (id.startsWith("area-stacked")) return "area";
  if (id.startsWith("range-")) return "range";
  if (id.startsWith("z-annotation")) return "annotation";
  if (id === "beeswarm") return "distribution";
  if (id === "population-pyramid") return "population";
  if (id === "scatter-bubble-plot") return "scatter";
  if (id === "slope-chart") return "slope";
  if (id === "waterfall") return "waterfall";
  if (id === "doughnut") return "doughnut";
  if (id === "heatmap") return "heatmap";
  if (id === "chart-menu") return "utility";
  return "chart";
}

function createEntry(
  id: string,
  name: string,
  overrides: Partial<ChartInventoryEntry> = {},
): ChartInventoryEntry {
  return {
    bespokeGeometry: false,
    family: inferFamily(id),
    id,
    name,
    path: `/${id}/`,
    usesAnnotations: false,
    usesEnhancedSelect: false,
    usesSharedHelpers: true,
    ...overrides,
  };
}

export const chartInventory: readonly ChartInventoryEntry[] = [
  createEntry("area-stacked", "Area stacked"),
  createEntry("area-stacked-sm", "Area stacked small multiple"),
  createEntry("bar-chart", "Bar chart"),
  createEntry("bar-chart-clustered", "Bar chart clustered"),
  createEntry("bar-chart-clustered-sm", "Bar chart clustered small multiple"),
  createEntry("bar-chart-grouped", "Bar chart grouped"),
  createEntry("bar-chart-grouped-clustered", "Bar chart grouped clustered"),
  createEntry("bar-chart-sm", "Bar chart small multiple"),
  createEntry("bar-chart-stacked", "Bar chart stacked"),
  createEntry("bar-chart-stacked-grouped", "Bar chart stacked grouped"),
  createEntry("bar-chart-stacked-sm", "Bar chart stacked small multiple", {
    usesAnnotations: true,
  }),
  createEntry("bar-chart-with-dropdown", "Bar chart with dropdown"),
  createEntry("beeswarm", "Beeswarm", {
    bespokeGeometry: true,
    usesEnhancedSelect: true,
  }),
  createEntry("chart-menu", "Chart menu", {
    family: "utility",
    notes: "Legacy explorer rather than a chart template.",
    usesSharedHelpers: false,
  }),
  createEntry("column-chart", "Column chart"),
  createEntry("column-chart-ci-bands", "Column chart CI bands"),
  createEntry("column-chart-stacked-optional-line", "Column chart stacked optional line"),
  createEntry(
    "column-chart-stacked-optional-line-sm",
    "Column chart stacked optional line small multiple",
  ),
  createEntry("doughnut", "Doughnut"),
  createEntry("heatmap", "Heatmap"),
  createEntry("line-chart", "Line chart"),
  createEntry("line-chart-dropdown-options", "Line chart dropdown options", {
    usesEnhancedSelect: true,
  }),
  createEntry("line-chart-sm-focus", "Line chart small multiple focus"),
  createEntry("line-chart-sm-multiseries", "Line chart small multiple multiseries"),
  createEntry("line-chart-with-ci-area", "Line chart with CI area", {
    usesAnnotations: true,
  }),
  createEntry("line-chart-with-ci-area-sm", "Line chart with CI area small multiple", {
    usesAnnotations: true,
  }),
  createEntry("population-pyramid", "Population pyramid", {
    bespokeGeometry: true,
    usesEnhancedSelect: true,
  }),
  createEntry("range-arrow-dot-bar-reference", "Range arrow dot bar reference", {
    usesAnnotations: true,
  }),
  createEntry(
    "range-arrow-dot-bar-reference-sm",
    "Range arrow dot bar reference small multiple",
    {
      usesAnnotations: true,
    },
  ),
  createEntry("range-ci-area-grouped", "Range CI area grouped", {
    usesAnnotations: true,
  }),
  createEntry("scatter-bubble-plot", "Scatter bubble plot", {
    usesEnhancedSelect: true,
  }),
  createEntry("slope-chart", "Slope chart"),
  createEntry("waterfall", "Waterfall", {
    bespokeGeometry: true,
    usesAnnotations: true,
  }),
  createEntry("z-annotation-bar-example", "Z annotation bar example", {
    usesAnnotations: true,
  }),
  createEntry("z-annotation-column-example", "Z annotation column example", {
    usesAnnotations: true,
  }),
  createEntry("z-annotation-load-from-file", "Z annotation load from file", {
    usesAnnotations: true,
  }),
  createEntry("z-annotation-toolbar", "Z annotation toolbar", {
    usesAnnotations: true,
  }),
] as const;

export const repeatedPrimitives: readonly SharedPrimitiveSummary[] = [
  {
    id: "scales",
    name: "Scales",
    description:
      "Linear, band, time, ordinal, and radius scales recur across bar, line, scatter, range, and heatmap templates.",
    evidence: [
      "bar-chart/script.js",
      "line-chart/script.js",
      "scatter-bubble-plot/script.js",
      "range-ci-area-grouped/script.js",
    ],
  },
  {
    id: "axes",
    name: "Axes",
    description:
      "Axis generators, tick formatting, grid lines, and wrapped labels are repeated in nearly every cartesian chart.",
    evidence: [
      "bar-chart/script.js",
      "column-chart/script.js",
      "line-chart/script.js",
      "lib/helpers.js",
    ],
  },
  {
    id: "responsive-resize",
    name: "Responsive resize",
    description:
      "Charts size themselves from the #graphic container and rerender through shared initialise logic and pym callbacks.",
    evidence: [
      "lib/helpers.js",
      "area-stacked/script.js",
      "line-chart-sm-focus/script.js",
      "population-pyramid/script.js",
    ],
  },
  {
    id: "colour-application",
    name: "Colour application",
    description:
      "Series palettes, grid colours, text contrast, and direct hex use can be centralised behind a shared theme layer.",
    evidence: [
      "lib/colours.js",
      "lib/globalStyle.css",
      "line-chart/config.js",
      "scatter-bubble-plot/script.js",
    ],
  },
  {
    id: "legends",
    name: "Legends",
    description:
      "Legend block creation, symbol rendering, and visibility rules are shared across grouped, line, range, and CI charts.",
    evidence: [
      "line-chart/script.js",
      "range-arrow-dot-bar-reference/script.js",
      "scatter-bubble-plot/script.js",
      "lib/helpers.js",
    ],
  },
  {
    id: "annotations",
    name: "Annotations",
    description:
      "Arrowheads, mobile annotation fallbacks, and toolbar patterns already exist in lib/helpers.js and the z-annotation demos.",
    evidence: [
      "lib/helpers.js",
      "z-annotation-toolbar/script.js",
      "z-annotation-load-from-file/script.js",
      "range-ci-area-grouped/script.js",
    ],
  },
] as const;

export const bespokeCharts = chartInventory.filter(
  (chart) => chart.bespokeGeometry,
);

export const standaloneCharts = chartInventory.filter(
  (chart) => !chart.usesSharedHelpers,
);

export const responsiveVariantEntries: readonly ResponsiveVariantEntry[] =
  chartInventory
    .filter((chart) => chart.id.endsWith("-sm"))
    .flatMap((chart) => {
      const baseId = chart.id.slice(0, -3);

      return chartInventory.some((candidate) => candidate.id === baseId)
        ? [
            {
              baseId,
              breakpoint: "sm" as const,
              variantId: chart.id,
            },
          ]
        : [];
    });

export const responsiveVariantLookup = Object.fromEntries(
  responsiveVariantEntries.map((entry) => [entry.baseId, entry]),
) as Readonly<Record<string, ResponsiveVariantEntry>>;

export const chartInventorySummary = {
  bespokeCharts: bespokeCharts.length,
  responsiveVariants: responsiveVariantEntries.length,
  standaloneCharts: standaloneCharts.length,
  totalCharts: chartInventory.length,
  usingSharedHelpers: chartInventory.filter((chart) => chart.usesSharedHelpers)
    .length,
} as const;
