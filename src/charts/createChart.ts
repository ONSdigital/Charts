import { select } from "d3-selection";

import {
  createConditionalConfigContext,
  resolveChartConfig,
  resolveConfigForContainer,
  resolveDynamicConfig,
} from "../config";
import { parseData, transformData } from "../data";
import { deepMerge } from "../theme/mergeTheme";
import type {
  BaseChartConfig,
  BreakpointKey,
  ChartConfigInput,
  ChartDataInput,
  ChartDefinition,
  ChartEventBus,
  ChartInstance,
  ChartPlugin,
  ChartPluginContext,
  ChartRenderContext,
  ChartRenderReason,
  ChartRenderResult,
  ConditionalConfigContext,
  ControlConfig,
  ControlSelectionValue,
  CreateChartOptions,
  DeepPartial,
  NormalizedDataset,
  ResolvedChartConfig,
  ResolvedChartFrame,
} from "../types";
import {
  applyChartAccessibility,
  createEventBus,
  createChartContext,
  resolveChartEnvironment,
} from "../core";
import type { ResolvedPluginInstance } from "../plugins/resolvePlugins";
import { resolveChartPlugins } from "../plugins/resolvePlugins";
import { observeResize } from "../core/responsive";
import { renderControls, resolveControlValues, applyControlConfigState, applyControlDataState } from "./controls";
import { joinChartDom } from "./dom";

let chartInstanceCount = 0;

function applyRenderResult(
  result: ChartRenderResult,
  registerCleanup: (cleanup: () => void) => () => void,
): void {
  if (typeof result === "function") {
    registerCleanup(result);
    return;
  }

  if (result?.destroy !== undefined) {
    registerCleanup(result.destroy);
  }
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

export async function createChart<TConfig extends BaseChartConfig>(
  definition: ChartDefinition<TConfig>,
  options: CreateChartOptions<TConfig>,
): Promise<ChartInstance<TConfig>> {
  const instanceId = `ons-charts-${definition.id}-${++chartInstanceCount}`;
  const getConfigContext = (
    overrides: Partial<ConditionalConfigContext> = {},
  ): ConditionalConfigContext =>
    createConditionalConfigContext({
      ...(typeof options.configContext === "function"
        ? options.configContext()
        : options.configContext ?? {}),
      ...overrides,
    });
  const initialConfig = resolveChartConfig(
    resolveDynamicConfig(options.config, getConfigContext()),
    {
      defaults: definition.defaults,
      typeFallback: definition.id,
    },
  );

  const state: {
    activePlugins: readonly ResolvedPluginInstance[];
    baseConfig: ResolvedChartConfig<TConfig>;
    breakpoint: BreakpointKey;
    config: ResolvedChartConfig<TConfig>;
    controlValues: Record<string, ControlSelectionValue>;
    data: NormalizedDataset;
    destroyed: boolean;
    dom: ChartRenderContext<TConfig>["dom"] | undefined;
    effectiveRawConfig: ChartConfigInput<TConfig>;
    eventBus: ChartEventBus;
    frame: ResolvedChartFrame | undefined;
    inputData?: ChartDataInput;
    lastRenderReason: ChartRenderReason;
    pluginPrivateState: Map<string, unknown>;
    rawConfig: ChartConfigInput<TConfig>;
    renderCleanup: (() => void) | undefined;
    renderPluginState: Map<string, unknown>;
    resizeCleanup: (() => void) | undefined;
    sourceData: NormalizedDataset;
  } = {
    activePlugins: [],
    baseConfig: initialConfig,
    breakpoint: "lg",
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
    eventBus: options.eventBus ?? createEventBus(),
    frame: undefined,
    inputData: options.data,
    lastRenderReason: "initial",
    pluginPrivateState: new Map<string, unknown>(),
    rawConfig: options.config,
    renderCleanup: undefined,
    renderPluginState: new Map<string, unknown>(),
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

  function refreshBaseConfig(): void {
    const unresolvedConfig = resolveChartConfig(
      resolveDynamicConfig(
        state.rawConfig,
        getConfigContext({ breakpoint: state.breakpoint }),
      ),
      {
        defaults: definition.defaults,
        typeFallback: definition.id,
      },
    );

    state.controlValues = resolveControlValues(
      unresolvedConfig.controls,
      state.controlValues,
    );
    state.effectiveRawConfig = applyControlConfigState({
      config: state.rawConfig,
      controls: unresolvedConfig.controls,
      values: state.controlValues,
    });
    const resolvedBaseConfig = resolveConfigForContainer({
      config: state.effectiveRawConfig,
      context: getConfigContext(),
      container: options.container,
      defaults: definition.defaults,
      theme: options.theme,
      typeFallback: definition.id,
    });

    state.breakpoint = resolvedBaseConfig.breakpoint;
    state.baseConfig = resolvedBaseConfig.config;
    state.controlValues = resolveControlValues(
      state.baseConfig.controls,
      state.controlValues,
    );
  }

  function teardownRenderEffects(): void {
    state.renderCleanup?.();
    state.renderCleanup = undefined;
  }

  function createPluginContext(
    activePlugin: ResolvedPluginInstance,
    context?: ChartRenderContext<TConfig>,
  ): ChartPluginContext<TConfig> {
    const noOpCleanup = () => {};
    const noOpAddEventListener: ChartPluginContext<TConfig>["addEventListener"] =
      () => noOpCleanup;
    const noOpRegisterCleanup: ChartPluginContext<TConfig>["registerCleanup"] =
      () => noOpCleanup;

    if (state.dom === undefined) {
      throw new Error("Cannot build plugin context before chart DOM has been initialised.");
    }

    if (context === undefined && state.frame === undefined) {
      throw new Error("Cannot build plugin context before chart frame has been resolved.");
    }

    return {
      addEventListener: context?.addEventListener ?? noOpAddEventListener,
      breakpoint: state.breakpoint,
      config: state.config,
      configContext:
        context?.configContext ??
        getConfigContext({ breakpoint: state.breakpoint }),
      container: options.container,
      data: state.data,
      destroy: instance.destroy,
      dom: state.dom,
      eventBus: state.eventBus,
      frame: context?.frame ?? state.frame!,
      getPluginState: <T = unknown>(key: string): T | undefined =>
        (context?.getPluginState<T>(key) ??
          (state.renderPluginState.get(key) as T | undefined)),
      getState: <T = unknown>(): T | undefined =>
        state.pluginPrivateState.get(activePlugin.name) as T | undefined,
      options: activePlugin.options,
      reason: context?.reason ?? state.lastRenderReason,
      registerCleanup: context?.registerCleanup ?? noOpRegisterCleanup,
      selection: context?.selection ?? select(state.dom.host),
      setState: (pluginState: unknown) => {
        state.pluginPrivateState.set(activePlugin.name, pluginState);
      },
      sourceData: state.sourceData,
      update: instance.update,
    };
  }

  function syncPlugins(context: ChartRenderContext<TConfig>): void {
    const nextPlugins = resolveChartPlugins(state.config.plugins);
    const previousPlugins = new Map(
      state.activePlugins.map((plugin) => [plugin.name, plugin]),
    );
    const nextPluginNames = new Set(nextPlugins.map((plugin) => plugin.name));

    previousPlugins.forEach((plugin, name) => {
      if (nextPluginNames.has(name)) {
        return;
      }

      (plugin.plugin as ChartPlugin<TConfig>).onDestroy?.(
        createPluginContext(plugin, context),
      );
      state.pluginPrivateState.delete(name);
    });

    nextPlugins.forEach((plugin) => {
      if (previousPlugins.has(plugin.name)) {
        return;
      }

      (plugin.plugin as ChartPlugin<TConfig>).onInit?.(
        createPluginContext(plugin, context),
      );
    });

    state.activePlugins = nextPlugins;
  }

  function runPluginHooks(context: ChartRenderContext<TConfig>): void {
    state.activePlugins.forEach((plugin) => {
      const pluginContext = createPluginContext(plugin, context);
      const activePlugin = plugin.plugin as ChartPlugin<TConfig>;

      activePlugin.onRender?.(pluginContext);

      if (context.reason === "update" || context.reason === "control") {
        activePlugin.onUpdate?.(pluginContext);
      }
    });
  }

  function handleControlChange(
    control: ControlConfig,
    value: ControlSelectionValue,
  ): void {
    if (state.destroyed) {
      return;
    }

    state.controlValues = {
      ...state.controlValues,
      [control.id]: value,
    };

    void updateInternal("control");
  }

  function renderInternal(reason: ChartRenderReason): void {
    if (state.destroyed) {
      return;
    }

    teardownRenderEffects();
    state.lastRenderReason = reason;

    const resolvedForContainer = resolveConfigForContainer({
      config: state.effectiveRawConfig,
      context: getConfigContext(),
      container: options.container,
      defaults: definition.defaults,
      theme: options.theme,
      typeFallback: definition.id,
    });
    const activeConfigContext = getConfigContext({
      breakpoint: resolvedForContainer.breakpoint,
    });

    state.breakpoint = resolvedForContainer.breakpoint;
    state.config = resolvedForContainer.config;
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

    const environment = resolveChartEnvironment({
      config: state.config,
      container: options.container,
      theme: options.theme,
    });
    const dom = joinChartDom({
      container: options.container,
      frame: environment.frame,
      id: instanceId,
      motion: environment.motion,
      reason,
    });

    state.dom = dom;
    state.frame = environment.frame;
    applyChartAccessibility({
      breakpoint: state.breakpoint,
      config: state.config,
      data: state.data,
      dom,
    });

    const renderCleanups = new Set<() => void>();
    const registerCleanup = (cleanup: () => void): (() => void) => {
      renderCleanups.add(cleanup);

      return () => {
        renderCleanups.delete(cleanup);
      };
    };
    const addEventListener = <Target extends EventTarget>(
      target: Target,
      type: string,
      listener: EventListenerOrEventListenerObject,
      listenerOptions?: AddEventListenerOptions | boolean,
    ): (() => void) => {
      target.addEventListener(type, listener, listenerOptions);

      return registerCleanup(() =>
        target.removeEventListener(type, listener, listenerOptions),
      );
    };
    const pluginState = new Map<string, unknown>();

    state.renderPluginState = pluginState;

    const context = createChartContext({
      addEventListener,
      config: state.config,
      configContext: activeConfigContext,
      container: options.container,
      data: state.data,
      dom,
      environment,
      eventBus: state.eventBus,
      pluginState,
      reason,
      registerCleanup,
      sourceData: state.sourceData,
    });

    renderControls({
      controls: state.config.controls,
      controlValues: state.controlValues,
      onChange: handleControlChange,
      registerCleanup,
      targetBottom: dom.controlsBottom,
      targetTop: dom.controlsTop,
    });
    syncPlugins(context);
    applyRenderResult(definition.render(context), registerCleanup);
    state.config.overrides.postRender?.(context.selection, context);
    runPluginHooks(context);

    state.renderCleanup = () => {
      for (const cleanup of Array.from(renderCleanups).reverse()) {
        cleanup();
      }

      renderCleanups.clear();
    };
  }

  async function loadSourceData(): Promise<void> {
    state.sourceData = await parseData({
      config: state.baseConfig,
      data: state.inputData,
      fetcher: options.fetcher,
    });
  }

  async function updateInternal(
    reason: Extract<ChartRenderReason, "update" | "control">,
    newData?: ChartDataInput,
    newConfig?: DeepPartial<ChartConfigInput<TConfig>>,
  ): Promise<ChartInstance<TConfig>> {
    if (state.destroyed) {
      throw new Error(`Cannot update destroyed chart instance "${definition.id}".`);
    }

    const previousFingerprint = getDataSourceFingerprint(
      state.baseConfig,
      state.inputData,
    );

    if (newData !== undefined) {
      state.inputData = newData;
    }

    if (newConfig !== undefined) {
      state.rawConfig = deepMerge(
        state.rawConfig,
        newConfig,
      ) as ChartConfigInput<TConfig>;
    }

    refreshBaseConfig();

    if (
      newData !== undefined ||
      previousFingerprint !== getDataSourceFingerprint(state.baseConfig, state.inputData)
    ) {
      await loadSourceData();
    }

    renderInternal(reason);
    return instance;
  }

  const instance: ChartInstance<TConfig> = {
    get breakpoint() {
      return state.breakpoint;
    },
    get config() {
      return state.config;
    },
    get id() {
      return instanceId;
    },
    get container() {
      return options.container;
    },
    get data() {
      return state.data;
    },
    get destroyed() {
      return state.destroyed;
    },
    destroy() {
      if (state.destroyed) {
        return;
      }

      state.activePlugins.forEach((plugin) => {
        (plugin.plugin as ChartPlugin<TConfig>).onDestroy?.(
          createPluginContext(plugin),
        );
      });
      state.activePlugins = [];
      state.pluginPrivateState.clear();
      state.destroyed = true;
      state.resizeCleanup?.();
      teardownRenderEffects();
      select(options.container).selectAll(".ons-charts-root").remove();
    },
    async render(reason = "update") {
      renderInternal(reason);
      return instance;
    },
    get sourceData() {
      return state.sourceData;
    },
    async update(newData, newConfig) {
      return updateInternal("update", newData, newConfig);
    },
  };

  refreshBaseConfig();
  await loadSourceData();
  renderInternal("initial");

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

      renderInternal("resize");
    },
    undefined,
    { emitInitial: false },
  );

  return instance;
}

export function renderChart<TConfig extends BaseChartConfig>(
  definition: ChartDefinition<TConfig>,
  options: CreateChartOptions<TConfig>,
): Promise<ChartInstance<TConfig>> {
  return createChart(definition, options);
}

export default createChart;
