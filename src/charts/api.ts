import { resolveDynamicConfig } from "../config";
import { deepMerge } from "../theme/mergeTheme";
import type {
  BaseChartConfig,
  ChartConfigInput,
  ChartDataInput,
  ChartDefinition,
  ChartInstance,
  CreateChartOptions,
  CreateGridOptions,
  DeepPartial,
  GridConfigInput,
  GridInstance,
} from "../types";
import { createChart } from "./createChart";
import { createGrid } from "./createGrid";
import { getChartDefinition } from "./registry";

function isChartDefinition<TConfig extends BaseChartConfig>(
  value: unknown,
): value is ChartDefinition<TConfig> {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "render" in value &&
    "displayName" in value
  );
}

function resolveChartType<TConfig extends BaseChartConfig>(
  config: ChartConfigInput<TConfig>,
): string {
  const type = resolveDynamicConfig(config).type;

  if (typeof type !== "string" || type.length === 0) {
    throw new Error("Chart config must include a string type to use ONSCharts.create().");
  }

  return type;
}

function resolveRegisteredChartDefinition<TConfig extends BaseChartConfig>(
  config: ChartConfigInput<TConfig>,
): ChartDefinition<TConfig> {
  const definition = getChartDefinition<TConfig>(resolveChartType(config));

  if (definition === undefined) {
    throw new Error(
      `No chart definition has been registered for type "${resolveChartType(config)}".`,
    );
  }

  return definition;
}

function resolveRegisteredGridDefinition<TConfig extends BaseChartConfig>(
  config: GridConfigInput<TConfig>,
): ChartDefinition<TConfig> {
  const { facet: _facet, ...chartConfig } = config as GridConfigInput<TConfig> & {
    facet: unknown;
  };

  return resolveRegisteredChartDefinition(
    chartConfig as unknown as ChartConfigInput<TConfig>,
  );
}

type CreatePublicOptions<TConfig extends BaseChartConfig> = Omit<
  CreateChartOptions<TConfig>,
  "config" | "container"
>;

type GridPublicOptions<TConfig extends BaseChartConfig> = Omit<
  CreateGridOptions<TConfig>,
  "config" | "container"
>;

export async function create<TConfig extends BaseChartConfig>(
  definition: ChartDefinition<TConfig>,
  options: CreateChartOptions<TConfig>,
): Promise<ChartInstance<TConfig>>;
export async function create<TConfig extends BaseChartConfig>(
  container: HTMLElement,
  config: ChartConfigInput<TConfig>,
  options?: CreatePublicOptions<TConfig>,
): Promise<ChartInstance<TConfig>>;
export async function create<TConfig extends BaseChartConfig>(
  definitionOrContainer: ChartDefinition<TConfig> | HTMLElement,
  optionsOrConfig: CreateChartOptions<TConfig> | ChartConfigInput<TConfig>,
  maybeOptions: CreatePublicOptions<TConfig> = {},
): Promise<ChartInstance<TConfig>> {
  if (isChartDefinition(definitionOrContainer)) {
    return createChart(
      definitionOrContainer,
      optionsOrConfig as CreateChartOptions<TConfig>,
    ) as Promise<ChartInstance<TConfig>>;
  }

  const container = definitionOrContainer as HTMLElement;
  let activeConfig = optionsOrConfig as ChartConfigInput<TConfig>;
  let activeData = maybeOptions.data;
  let activeDefinition = resolveRegisteredChartDefinition(activeConfig);
  let activeChart = await createChart(activeDefinition, {
    ...maybeOptions,
    config: activeConfig,
    container,
  });

  const proxy: ChartInstance<TConfig> = {
    get breakpoint() {
      return activeChart.breakpoint;
    },
    get config() {
      return activeChart.config;
    },
    get container() {
      return container;
    },
    get data() {
      return activeChart.data;
    },
    get destroyed() {
      return activeChart.destroyed;
    },
    destroy() {
      activeChart.destroy();
    },
    get id() {
      return activeChart.id;
    },
    async render(reason = "update") {
      await activeChart.render(reason);
      return proxy;
    },
    get sourceData() {
      return activeChart.sourceData;
    },
    async update(newData, newConfig) {
      if (newData !== undefined) {
        activeData = newData;
      }

      if (newConfig !== undefined) {
        activeConfig = deepMerge(
          activeConfig,
          newConfig,
        ) as ChartConfigInput<TConfig>;
      }

      const nextDefinition = resolveRegisteredChartDefinition(activeConfig);

      if (nextDefinition.id !== activeDefinition.id) {
        activeChart.destroy();
        activeDefinition = nextDefinition;
        activeChart = await createChart(activeDefinition, {
          ...maybeOptions,
          config: activeConfig,
          container,
          data: activeData,
        });
        return proxy;
      }

      await activeChart.update(newData, newConfig);
      return proxy;
    },
  };

  return proxy;
}

export async function grid<TConfig extends BaseChartConfig>(
  definition: ChartDefinition<TConfig>,
  options: CreateGridOptions<TConfig>,
): Promise<GridInstance<TConfig>>;
export async function grid<TConfig extends BaseChartConfig>(
  container: HTMLElement,
  config: GridConfigInput<TConfig>,
  options?: GridPublicOptions<TConfig>,
): Promise<GridInstance<TConfig>>;
export async function grid<TConfig extends BaseChartConfig>(
  definitionOrContainer: ChartDefinition<TConfig> | HTMLElement,
  optionsOrConfig: CreateGridOptions<TConfig> | GridConfigInput<TConfig>,
  maybeOptions: GridPublicOptions<TConfig> = {},
): Promise<GridInstance<TConfig>> {
  if (isChartDefinition(definitionOrContainer)) {
    return createGrid(
      definitionOrContainer,
      optionsOrConfig as CreateGridOptions<TConfig>,
    ) as Promise<GridInstance<TConfig>>;
  }

  const container = definitionOrContainer as HTMLElement;
  let activeConfig = optionsOrConfig as GridConfigInput<TConfig>;
  let activeData = maybeOptions.data;
  let activeDefinition = resolveRegisteredGridDefinition(activeConfig);
  let activeGrid = await createGrid(activeDefinition, {
    ...maybeOptions,
    config: activeConfig,
    container,
  });

  const proxy: GridInstance<TConfig> = {
    get breakpoint() {
      return activeGrid.breakpoint;
    },
    get children() {
      return activeGrid.children;
    },
    get container() {
      return container;
    },
    get data() {
      return activeGrid.data;
    },
    destroy() {
      activeGrid.destroy();
    },
    emit(type, payload) {
      activeGrid.emit(type, payload);
    },
    on(type, listener) {
      return activeGrid.on(type, listener);
    },
    async update(newData, newConfig) {
      if (newData !== undefined) {
        activeData = newData;
      }

      if (newConfig !== undefined) {
        activeConfig = deepMerge(
          activeConfig,
          newConfig,
        ) as GridConfigInput<TConfig>;
      }

      const nextDefinition = resolveRegisteredGridDefinition(activeConfig);

      if (nextDefinition.id !== activeDefinition.id) {
        activeGrid.destroy();
        activeDefinition = nextDefinition;
        activeGrid = await createGrid(activeDefinition, {
          ...maybeOptions,
          config: activeConfig,
          container,
          data: activeData,
        });
        return proxy;
      }

      await activeGrid.update(newData, newConfig as DeepPartial<GridConfigInput<TConfig>>);
      return proxy;
    },
  };

  return proxy;
}
