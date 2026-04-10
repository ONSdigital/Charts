import { resolveConfigForContainer, resolveDynamicConfig } from "../config";
import { createEventBus, observeResize, resolveResponsiveValue } from "../core";
import { parseData, transformData } from "../data";
import { deepMerge } from "../theme/mergeTheme";
import type {
  BaseChartConfig,
  BreakpointKey,
  ChartConfigInput,
  ChartDataInput,
  ChartDefinition,
  ChartInstance,
  ConditionalConfigContext,
  ControlSelectionValue,
  CreateGridOptions,
  DeepPartial,
  GridChildInstance,
  GridConfigInput,
  GridFacetConfig,
  GridInstance,
  GridPanelRole,
  NormalizedDataRow,
  NormalizedDataset,
  Primitive,
  ResolvedChartConfig,
} from "../types";
import { applyControlConfigState, applyControlDataState, renderControls, resolveControlValues } from "./controls";
import { createChart } from "./createChart";
import { joinGridDom, type GridDom } from "./gridDom";

const DEFAULT_GRID_COLUMNS: Record<BreakpointKey, number> = {
  sm: 1,
  md: 2,
  lg: 3,
};

interface GridChildState<TConfig extends BaseChartConfig> {
  chart?: ChartInstance<TConfig>;
  chartContainer: HTMLDivElement;
  configFingerprint: string;
  context: ConditionalConfigContext;
  facetValue: Primitive;
  panel: HTMLDivElement;
}

function serialiseValue(value: unknown): string {
  if (value === undefined) {
    return "__undefined__";
  }

  if (value === null) {
    return "__null__";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function serialiseInputData(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value === undefined) {
    return "undefined";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getDataSourceFingerprint<TConfig extends BaseChartConfig>(
  config: ResolvedChartConfig<TConfig>,
  inputData?: ChartDataInput,
): string {
  if (inputData !== undefined) {
    return "__external-input__";
  }

  return JSON.stringify({
    dataUrl: config.data.dataUrl,
    format: config.data.format ?? "auto",
    rowIdKey: config.data.rowIdKey,
    source: serialiseInputData(config.data.source),
  });
}

function splitGridConfig<TConfig extends BaseChartConfig>(
  config: GridConfigInput<TConfig>,
): {
  chartConfig: ChartConfigInput<TConfig>;
  facetConfig: GridConfigInput<TConfig>["facet"];
} {
  const { facet, ...chartConfig } = config as GridConfigInput<TConfig> & {
    facet: GridConfigInput<TConfig>["facet"];
  };

  return {
    chartConfig: chartConfig as unknown as ChartConfigInput<TConfig>,
    facetConfig: facet,
  };
}

function resolveFacetConfig<TConfig extends BaseChartConfig>(
  config: GridConfigInput<TConfig>,
  context: Partial<ConditionalConfigContext> = {},
): GridFacetConfig {
  const resolveDynamicFacet = resolveDynamicConfig as unknown as (
    config: { facet: GridFacetConfig },
    context?: Partial<ConditionalConfigContext>,
  ) => { facet: GridFacetConfig };

  return resolveDynamicFacet(
    { facet: splitGridConfig(config).facetConfig as unknown as GridFacetConfig },
    context,
  ).facet;
}

function resolveGridColumns(
  facet: GridFacetConfig,
  breakpoint: BreakpointKey,
): number {
  return (
    resolveResponsiveValue(facet.columns, breakpoint) ??
    DEFAULT_GRID_COLUMNS[breakpoint]
  );
}

function inferPanelRole(
  rows: readonly NormalizedDataRow[],
  facet: GridFacetConfig,
  facetValue: Primitive,
): GridPanelRole {
  if (facet.roleField !== undefined) {
    const role = rows[0]?.[facet.roleField];

    if (role === "focus" || role === "context" || role === "default") {
      return role;
    }
  }

  if (
    facet.focusValues?.some((candidate) => serialiseValue(candidate) === serialiseValue(facetValue))
  ) {
    return "focus";
  }

  return facet.focusValues !== undefined ? "context" : "default";
}

function buildPanelContext(options: {
  columns: number;
  facet: GridFacetConfig;
  facetValue: Primitive;
  index: number;
  panelCount: number;
  role: GridPanelRole;
}): ConditionalConfigContext {
  const row = Math.floor(options.index / options.columns);
  const column = options.index % options.columns;

  return {
    column,
    columns: options.columns,
    facetField: options.facet.field,
    facetValue: options.facetValue,
    index: options.index,
    isFirst: options.index === 0,
    isFirstInRow: column === 0,
    isLast: options.index === options.panelCount - 1,
    isLastInRow:
      column === options.columns - 1 || options.index === options.panelCount - 1,
    panelCount: options.panelCount,
    role: options.role,
    row,
  };
}

function groupRowsByFacet(
  rows: readonly NormalizedDataRow[],
  field: string,
): Array<{ facetValue: Primitive; rows: readonly NormalizedDataRow[] }> {
  const grouped = new Map<string, { facetValue: Primitive; rows: NormalizedDataRow[] }>();

  rows.forEach((row) => {
    const rawFacetValue = row[field];
    const facetValue =
      rawFacetValue === null ||
      rawFacetValue === undefined ||
      typeof rawFacetValue === "string" ||
      typeof rawFacetValue === "number" ||
      typeof rawFacetValue === "boolean"
        ? (rawFacetValue as Primitive)
        : serialiseValue(rawFacetValue);
    const key = serialiseValue(facetValue);
    const group = grouped.get(key) ?? {
      facetValue,
      rows: [],
    };

    group.rows.push(row);
    grouped.set(key, group);
  });

  return Array.from(grouped.values());
}

function isNumericValue(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function coerceNumericValue(value: unknown): number | undefined {
  if (isNumericValue(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return undefined;
}

function inferDomain(values: readonly unknown[]): Primitive | readonly Primitive[] | undefined {
  const filteredValues = values.filter(
    (value) => value !== undefined && value !== null && value !== "",
  );

  if (filteredValues.length === 0) {
    return undefined;
  }

  const numericValues = filteredValues
    .map((value) => coerceNumericValue(value))
    .filter((value): value is number => value !== undefined);

  if (numericValues.length === filteredValues.length) {
    return [Math.min(...numericValues), Math.max(...numericValues)];
  }

  const dateValues = filteredValues
    .map((value) => (value instanceof Date ? value : typeof value === "string" ? new Date(value) : undefined))
    .filter((value): value is Date => value instanceof Date && !Number.isNaN(value.getTime()));

  if (dateValues.length === filteredValues.length) {
    const sortedDates = [...dateValues].sort(
      (left, right) => left.getTime() - right.getTime(),
    );

    return [
      sortedDates[0]!.toISOString(),
      sortedDates[sortedDates.length - 1]!.toISOString(),
    ];
  }

  return Array.from(
    new Set(filteredValues.map((value) => String(value))),
  );
}

function resolveAxisValues<TConfig extends BaseChartConfig>(options: {
  axis: "x" | "y" | "y2";
  config: ResolvedChartConfig<TConfig>;
  data: NormalizedDataset;
  facetField: string;
}): readonly unknown[] {
  if (options.axis === "x") {
    const explicitKeys = options.config.series
      .map((series) => series.xKey)
      .filter((value): value is string => value !== undefined);
    const fallbackKey =
      explicitKeys[0] ??
      options.data.columns.find(
        (column) =>
          column !== options.facetField && (column === "date" || column === "x"),
      ) ??
      options.data.columns.find((column) => column !== options.facetField);

    if (fallbackKey === undefined) {
      return [];
    }

    return options.data.rows.map((row) => row[fallbackKey]);
  }

  const axisSeries = options.data.series.filter((series) =>
    options.axis === "y"
      ? series.axis === "y"
      : series.axis === options.axis,
  );

  return axisSeries.flatMap((series) => series.values);
}

function resolveSharedAxisOverrides<TConfig extends BaseChartConfig>(options: {
  config: ResolvedChartConfig<TConfig>;
  data: NormalizedDataset;
  facet: GridFacetConfig;
}): ChartConfigInput<TConfig> {
  const axesOverride: Record<string, unknown> = {};

  (["x", "y", "y2"] as const).forEach((axis) => {
    const axisConfig = options.config.axes[axis];

    if (axisConfig?.shared === false || axisConfig?.domain !== undefined) {
      return;
    }

    const domain = inferDomain(
      resolveAxisValues({
        axis,
        config: options.config,
        data: options.data,
        facetField: options.facet.field,
      }),
    );

    if (domain === undefined) {
      return;
    }

    axesOverride[axis] = {
      ...(axisConfig ?? {}),
      domain,
    };
  });

  return Object.keys(axesOverride).length === 0
    ? ({} as ChartConfigInput<TConfig>)
    : ({
        axes: axesOverride,
      } as ChartConfigInput<TConfig>);
}

function buildChildConfig<TConfig extends BaseChartConfig>(options: {
  config: GridConfigInput<TConfig>;
  sharedAxes: ChartConfigInput<TConfig>;
}): ChartConfigInput<TConfig> {
  const { chartConfig } = splitGridConfig(options.config);
  const configWithoutControls = deepMerge(
    chartConfig as unknown as Record<string, unknown>,
    { controls: [] } as Record<string, unknown>,
  );

  return deepMerge(
    configWithoutControls,
    options.sharedAxes as unknown as Record<string, unknown>,
  ) as unknown as ChartConfigInput<TConfig>;
}

function createPanelDom(facetValue: Primitive): {
  chartContainer: HTMLDivElement;
  panel: HTMLDivElement;
} {
  const panel = document.createElement("div");
  const chartContainer = document.createElement("div");

  panel.className = "ons-charts-grid-panel";
  panel.dataset.facetValue = serialiseValue(facetValue);
  chartContainer.className = "ons-charts-grid-panel__chart";
  panel.append(chartContainer);

  return {
    chartContainer,
    panel,
  };
}

function getPanelConfigFingerprint<TConfig extends BaseChartConfig>(
  config: ResolvedChartConfig<TConfig>,
): string {
  return JSON.stringify(config);
}

export async function createGrid<TConfig extends BaseChartConfig>(
  definition: ChartDefinition<TConfig>,
  options: CreateGridOptions<TConfig>,
): Promise<GridInstance<TConfig>> {
  const instanceId = `ons-charts-grid-${definition.id}-${Date.now().toString(36)}`;
  const eventBus = createEventBus();
  const initialChartConfig = splitGridConfig(options.config).chartConfig;
  const initialConfig = resolveConfigForContainer({
    config: initialChartConfig,
    container: options.container,
    defaults: definition.defaults,
    theme: options.theme,
    typeFallback: definition.id,
  }).config;

  const state: {
    baseConfig: ResolvedChartConfig<TConfig>;
    breakpoint: BreakpointKey;
    children: Map<string, GridChildState<TConfig>>;
    config: ResolvedChartConfig<TConfig>;
    controlValues: Record<string, ControlSelectionValue>;
    data: NormalizedDataset;
    destroyed: boolean;
    dom: GridDom | undefined;
    effectiveRawConfig: GridConfigInput<TConfig>;
    facet: GridFacetConfig;
    inputData?: ChartDataInput;
    rawConfig: GridConfigInput<TConfig>;
    renderCleanup: (() => void) | undefined;
    renderQueue: Promise<void>;
    resizeCleanup: (() => void) | undefined;
    sourceData: NormalizedDataset;
  } = {
    baseConfig: initialConfig,
    breakpoint: "lg",
    children: new Map(),
    config: initialConfig,
    controlValues: resolveControlValues(initialConfig.controls, {}),
    data: {
      columns: [],
      input: {
        format: "auto",
        kind: "empty",
      },
      rowCount: 0,
      rows: [],
      series: [],
    },
    destroyed: false,
    dom: undefined,
    effectiveRawConfig: options.config,
    facet: resolveFacetConfig(options.config),
    inputData: options.data,
    rawConfig: options.config,
    renderCleanup: undefined,
    renderQueue: Promise.resolve(),
    resizeCleanup: undefined,
    sourceData: {
      columns: [],
      input: {
        format: "auto",
        kind: "empty",
      },
      rowCount: 0,
      rows: [],
      series: [],
    },
  };

  function teardownRenderEffects(): void {
    state.renderCleanup?.();
    state.renderCleanup = undefined;
  }

  function refreshBaseConfig(): void {
    const unresolvedConfig = resolveConfigForContainer({
      config: splitGridConfig(state.rawConfig).chartConfig,
      container: options.container,
      defaults: definition.defaults,
      theme: options.theme,
      typeFallback: definition.id,
    }).config;

    state.controlValues = resolveControlValues(
      unresolvedConfig.controls,
      state.controlValues,
    );
    state.effectiveRawConfig = applyControlConfigState({
      config: state.rawConfig,
      controls: unresolvedConfig.controls,
      values: state.controlValues,
    });

    const resolvedBase = resolveConfigForContainer({
      config: splitGridConfig(state.effectiveRawConfig).chartConfig,
      container: options.container,
      defaults: definition.defaults,
      theme: options.theme,
      typeFallback: definition.id,
    });

    state.breakpoint = resolvedBase.breakpoint;
    state.baseConfig = resolvedBase.config;
    state.facet = resolveFacetConfig(state.effectiveRawConfig, {
      breakpoint: state.breakpoint,
    });
    state.controlValues = resolveControlValues(
      state.baseConfig.controls,
      state.controlValues,
    );
  }

  async function loadSourceData(): Promise<void> {
    state.sourceData = await parseData({
      config: state.baseConfig,
      data: state.inputData,
      fetcher: options.fetcher,
    });
  }

  async function renderInternal(reason: "initial" | "update" | "resize" | "control"): Promise<void> {
    if (state.destroyed) {
      return;
    }

    teardownRenderEffects();

    const resolvedBase = resolveConfigForContainer({
      config: splitGridConfig(state.effectiveRawConfig).chartConfig,
      container: options.container,
      defaults: definition.defaults,
      theme: options.theme,
      typeFallback: definition.id,
    });

    state.breakpoint = resolvedBase.breakpoint;
    state.config = resolvedBase.config;
    state.facet = resolveFacetConfig(state.effectiveRawConfig, {
      breakpoint: state.breakpoint,
    });
    state.controlValues = resolveControlValues(
      state.config.controls,
      state.controlValues,
    );

    const transformedData = transformData(state.sourceData, {
      config: state.config,
      reason,
    });
    const controlledState = applyControlDataState({
      config: state.config,
      data: transformedData,
      values: state.controlValues,
    });

    state.config = controlledState.config;
    state.data = controlledState.data;

    const dom = joinGridDom({
      container: options.container,
      id: instanceId,
    });
    const columns = resolveGridColumns(state.facet, state.breakpoint);
    const sharedAxes = resolveSharedAxisOverrides({
      config: state.config,
      data: state.data,
      facet: state.facet,
    });
    const childConfig = buildChildConfig({
      config: state.effectiveRawConfig,
      sharedAxes,
    });
    const groupedPanels = groupRowsByFacet(state.data.rows, state.facet.field);
    const renderCleanups = new Set<() => void>();
    const registerCleanup = (cleanup: () => void): (() => void) => {
      renderCleanups.add(cleanup);

      return () => {
        renderCleanups.delete(cleanup);
      };
    };

    state.dom = dom;
    dom.panels.style.setProperty(
      "grid-template-columns",
      `repeat(${columns}, minmax(0, 1fr))`,
    );

    renderControls({
      controls: state.config.controls,
      controlValues: state.controlValues,
      onChange: (control, value) => {
        state.controlValues = {
          ...state.controlValues,
          [control.id]: value,
        };

        void updateInternal("control");
      },
      registerCleanup,
      targetBottom: dom.controlsBottom,
      targetTop: dom.controlsTop,
    });

    const activeKeys = new Set<string>();

    await Promise.all(
      groupedPanels.map(async ({ facetValue, rows }, index) => {
        const key = serialiseValue(facetValue);
        const existingChild = state.children.get(key);
        const role = inferPanelRole(rows, state.facet, facetValue);
        const context = buildPanelContext({
          columns,
          facet: state.facet,
          facetValue,
          index,
          panelCount: groupedPanels.length,
          role,
        });
        const panelDom = existingChild ?? (() => {
          const createdPanel = createPanelDom(facetValue);

          dom.panels.append(createdPanel.panel);

          return {
            chart: undefined,
            chartContainer: createdPanel.chartContainer,
            configFingerprint: "",
            context,
            facetValue,
            panel: createdPanel.panel,
          };
        })();

        panelDom.context = context;
        panelDom.facetValue = facetValue;
        panelDom.panel.dataset.role = role;
        dom.panels.append(panelDom.panel);

        const resolvedPanelConfig = resolveConfigForContainer({
          config: childConfig,
          context,
          container: panelDom.chartContainer,
          defaults: definition.defaults,
          theme: options.theme,
          typeFallback: definition.id,
        }).config;
        const configFingerprint = getPanelConfigFingerprint(resolvedPanelConfig);

        if (existingChild === undefined || existingChild.chart === undefined) {
          panelDom.chart = await createChart(definition, {
            config: childConfig,
            configContext: () => panelDom.context,
            container: panelDom.chartContainer,
            data: rows,
            eventBus,
            theme: options.theme,
          });
          panelDom.configFingerprint = configFingerprint;
          state.children.set(key, panelDom as GridChildState<TConfig>);
          activeKeys.add(key);
          return;
        }

        if (existingChild.configFingerprint !== configFingerprint) {
          existingChild.chart.destroy();
          existingChild.chart = await createChart(definition, {
            config: childConfig,
            configContext: () => existingChild.context,
            container: existingChild.chartContainer,
            data: rows,
            eventBus,
            theme: options.theme,
          });
          existingChild.configFingerprint = configFingerprint;
          activeKeys.add(key);
          return;
        }

        await existingChild.chart.update(rows);
        existingChild.configFingerprint = configFingerprint;
        activeKeys.add(key);
      }),
    );

    Array.from(state.children.entries()).forEach(([key, child]) => {
      if (activeKeys.has(key)) {
        return;
      }

      child.chart?.destroy();
      child.panel.remove();
      state.children.delete(key);
    });

    state.renderCleanup = () => {
      for (const cleanup of Array.from(renderCleanups).reverse()) {
        cleanup();
      }

      renderCleanups.clear();
    };
  }

  function queueRender(reason: "initial" | "update" | "resize" | "control"): Promise<void> {
    state.renderQueue = state.renderQueue.then(() => renderInternal(reason));
    return state.renderQueue;
  }

  async function updateInternal(
    reason: "update" | "control",
    newData?: ChartDataInput,
    newConfig?: DeepPartial<GridConfigInput<TConfig>>,
  ): Promise<GridInstance<TConfig>> {
    if (state.destroyed) {
      throw new Error(`Cannot update destroyed grid instance "${definition.id}".`);
    }

    const previousFingerprint = getDataSourceFingerprint(
      state.baseConfig,
      state.inputData,
    );

    if (newData !== undefined) {
      state.inputData = newData;
    }

    if (newConfig !== undefined) {
      state.rawConfig = deepMerge(state.rawConfig, newConfig) as GridConfigInput<TConfig>;
    }

    refreshBaseConfig();

    if (
      newData !== undefined ||
      previousFingerprint !== getDataSourceFingerprint(state.baseConfig, state.inputData)
    ) {
      await loadSourceData();
    }

    await queueRender(reason);
    return instance;
  }

  const instance: GridInstance<TConfig> = {
    get breakpoint() {
      return state.breakpoint;
    },
    get children(): readonly GridChildInstance<TConfig>[] {
      return Array.from(state.children.values())
        .filter(
          (
            child,
          ): child is GridChildState<TConfig> & { chart: ChartInstance<TConfig> } =>
            child.chart !== undefined,
        )
        .map((child) => ({
          chart: child.chart,
          context: child.context,
          facetValue: child.facetValue,
        }));
    },
    get container() {
      return options.container;
    },
    get data() {
      return state.data;
    },
    destroy() {
      if (state.destroyed) {
        return;
      }

      state.destroyed = true;
      state.resizeCleanup?.();
      teardownRenderEffects();
      Array.from(state.children.values()).forEach((child) => {
        child.chart?.destroy();
        child.panel.remove();
      });
      state.children.clear();
      state.dom?.host.remove();
    },
    emit: eventBus.emit,
    on: eventBus.on,
    async update(newData, newConfig) {
      return updateInternal(
        "update",
        newData,
        newConfig as DeepPartial<GridConfigInput<TConfig>> | undefined,
      );
    },
  };

  refreshBaseConfig();
  await loadSourceData();
  await queueRender("initial");

  let lastWidth = Math.round(options.container.getBoundingClientRect().width);
  let lastHeight = Math.round(options.container.getBoundingClientRect().height);

  state.resizeCleanup = observeResize(
    options.container,
    ({ height, width }) => {
      if (state.destroyed) {
        return;
      }

      const roundedWidth = Math.round(width);
      const roundedHeight = Math.round(height);

      if (roundedWidth === lastWidth && roundedHeight === lastHeight) {
        return;
      }

      lastWidth = roundedWidth;
      lastHeight = roundedHeight;

      void queueRender("resize");
    },
    undefined,
    { emitInitial: false },
  );

  return instance;
}

export default createGrid;
