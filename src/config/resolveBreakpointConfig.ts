import { getBreakpointFromWidth } from "../core/responsive";
import { deepMerge } from "../theme/mergeTheme";
import { resolveTheme } from "../theme/mergeTheme";
import type {
  BaseChartConfig,
  BreakpointKey,
  BreakpointOverrides,
  ChartConfigInput,
  ChartTheme,
  ConditionalConfigContext,
  ConfigOverrides,
  DeepPartial,
  PostRenderOverride,
  ResolvedChartConfig,
} from "../types";
import { createConditionalConfigContext, resolveDynamicConfig } from "./resolveDynamicConfig";
import { resolveChartConfig } from "./resolveChartConfig";

type ConfigObject = Partial<BaseChartConfig> & Record<string, unknown>;

function asConfigObject(value: unknown): ConfigObject {
  return typeof value === "object" && value !== null
    ? (value as ConfigObject)
    : {};
}

function getOverridesObject(
  overrides: unknown,
): ConfigOverrides {
  if (typeof overrides === "function") {
    return {
      postRender: overrides as PostRenderOverride<BaseChartConfig>,
    };
  }

  if (typeof overrides === "object" && overrides !== null) {
    return overrides as ConfigOverrides;
  }

  return {};
}

function getCombinedBreakpointOverrides(
  config: unknown,
): BreakpointOverrides {
  const configObject = asConfigObject(config);

  return deepMerge(
    getOverridesObject(configObject.overrides).breakpoints ?? {},
    (configObject.breakpoints as BreakpointOverrides | undefined) ?? {},
  );
}

function getContainerWidth(container: HTMLElement): number {
  return container.clientWidth || Math.round(container.getBoundingClientRect().width);
}

export function resolveConfigForBreakpoint<TConfig extends BaseChartConfig>(
  config: ChartConfigInput<TConfig>,
  breakpoint: BreakpointKey,
  options: {
    context?: Partial<ConditionalConfigContext>;
    defaults?: DeepPartial<TConfig>;
    typeFallback?: string;
  } = {},
): ResolvedChartConfig<TConfig> {
  const breakpointOverrides = getCombinedBreakpointOverrides(config)[breakpoint];
  const mergedConfig =
    breakpointOverrides === undefined
      ? config
      : (deepMerge(
          config,
          breakpointOverrides as DeepPartial<ChartConfigInput<TConfig>>,
        ) as ChartConfigInput<TConfig>);
  const resolvedConfig = resolveDynamicConfig(mergedConfig, {
    ...createConditionalConfigContext(options.context),
    breakpoint,
  });

  return resolveChartConfig(resolvedConfig, options);
}

export function resolveConfigForContainer<TConfig extends BaseChartConfig>(options: {
  config: ChartConfigInput<TConfig>;
  context?: Partial<ConditionalConfigContext>;
  container: HTMLElement;
  defaults?: DeepPartial<TConfig>;
  theme?: DeepPartial<ChartTheme>;
  typeFallback?: string;
}): {
  breakpoint: BreakpointKey;
  config: ResolvedChartConfig<TConfig>;
  width: number;
} {
  const baseConfig = resolveChartConfig(
    resolveDynamicConfig(options.config, options.context),
    {
      defaults: options.defaults,
      typeFallback: options.typeFallback,
    },
  );
  const theme = resolveTheme(options.theme ?? baseConfig.theme);
  const width = getContainerWidth(options.container);
  const breakpoint = getBreakpointFromWidth(width, theme.breakpoints);

  return {
    breakpoint,
    config: resolveConfigForBreakpoint(options.config, breakpoint, {
      context: options.context,
      defaults: options.defaults,
      typeFallback: options.typeFallback,
    }),
    width,
  };
}

export { getContainerWidth };
