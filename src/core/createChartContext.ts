import { select } from "d3-selection";

import { applyThemeVariables } from "../theme/cssVariables";
import { resolveTheme } from "../theme/mergeTheme";
import type {
  BaseChartConfig,
  ChartMargin,
  ChartMotionSettings,
  ChartEventBus,
  ChartRenderContext,
  ChartTheme,
  ConditionalConfigContext,
  DeepPartial,
  NormalizedDataset,
  ResolvedChartConfig,
  ResolvedChartFrame,
} from "../types";
import { createChartFrame } from "./layout";
import { getBreakpointFromWidth, resolveResponsiveValue } from "./responsive";

const DEFAULT_MARGIN: ChartMargin = {
  top: 15,
  right: 20,
  bottom: 50,
  left: 50,
};

const DEFAULT_ASPECT_RATIO: readonly [number, number] = [4, 3];

export interface ChartEnvironment {
  breakpoint: ChartRenderContext["breakpoint"];
  cssVariables: Record<string, string>;
  frame: ResolvedChartFrame;
  motion: ChartMotionSettings;
  theme: ChartTheme;
}

export function resolveChartEnvironment<TConfig extends BaseChartConfig>(options: {
  config: ResolvedChartConfig<TConfig>;
  container: HTMLElement;
  theme?: DeepPartial<ChartTheme>;
}): ChartEnvironment {
  const theme = resolveTheme(options.theme ?? options.config.theme);
  const containerWidth =
    options.container.clientWidth ||
    Math.round(options.container.getBoundingClientRect().width);
  const breakpoint = getBreakpointFromWidth(containerWidth, theme.breakpoints);
  const margin =
    resolveResponsiveValue(options.config.layout.margin, breakpoint) ??
    resolveResponsiveValue(options.config.margin, breakpoint) ??
    DEFAULT_MARGIN;
  const aspectRatio =
    resolveResponsiveValue(options.config.layout.aspectRatio, breakpoint) ??
    resolveResponsiveValue(options.config.aspectRatio, breakpoint) ??
    DEFAULT_ASPECT_RATIO;
  const frame = createChartFrame({
    aspectRatio,
    containerWidth,
    margin,
  });
  const cssVariables = applyThemeVariables(theme, options.container);
  const transition = options.config.layout.transition ?? {};
  const motion: ChartMotionSettings = {
    duration: transition.duration ?? 300,
    enabled: transition.enabled ?? true,
  };

  return {
    breakpoint,
    cssVariables,
    frame,
    motion,
    theme,
  };
}

export function createChartContext<TConfig extends BaseChartConfig>(options: {
  addEventListener: ChartRenderContext<TConfig>["addEventListener"];
  config: ResolvedChartConfig<TConfig>;
  configContext: ConditionalConfigContext;
  container: HTMLElement;
  data: NormalizedDataset;
  dom: ChartRenderContext<TConfig>["dom"];
  environment?: ChartEnvironment;
  eventBus: ChartEventBus;
  pluginState?: Map<string, unknown>;
  reason: ChartRenderContext<TConfig>["reason"];
  registerCleanup: ChartRenderContext<TConfig>["registerCleanup"];
  sourceData: NormalizedDataset;
  theme?: DeepPartial<ChartTheme>;
}): ChartRenderContext<TConfig> {
  const environment =
    options.environment ??
    resolveChartEnvironment({
      config: options.config,
      container: options.container,
      theme: options.theme,
    });
  const pluginState = options.pluginState ?? new Map<string, unknown>();

  return {
    addEventListener: options.addEventListener,
    breakpoint: environment.breakpoint,
    config: options.config,
    configContext: options.configContext,
    container: options.container,
    cssVariables: environment.cssVariables,
    data: options.data,
    dom: options.dom,
    eventBus: options.eventBus,
    frame: environment.frame,
    getPluginState: <T = unknown>(key: string): T | undefined =>
      pluginState.get(key) as T | undefined,
    motion: environment.motion,
    reason: options.reason,
    registerCleanup: options.registerCleanup,
    selection: select(options.dom.host),
    setPluginState: (key: string, state: unknown) => {
      pluginState.set(key, state);
    },
    size: environment.breakpoint,
    sourceData: options.sourceData,
    theme: environment.theme,
  };
}
