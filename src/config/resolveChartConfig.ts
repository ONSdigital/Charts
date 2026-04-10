import { deepMerge } from "../theme/mergeTheme";
import type {
  AccessibilityConfig,
  AxesConfig,
  AxisConfig,
  BaseChartConfig,
  BreakpointOverrides,
  ConfigOverrides,
  DataConfig,
  DeepPartial,
  LayoutConfig,
  ResolvedAccessibilityConfig,
  ResolvedChartConfig,
} from "../types";

const DEFAULT_LAYOUT: LayoutConfig = {
  transition: {
    duration: 300,
    enabled: true,
  },
};

const DEFAULT_ACCESSIBILITY: AccessibilityConfig = {
  role: "img",
  table: {
    hideAt: ["sm"],
  },
  touchTargetMinSize: 44,
};

function mergeDefaults<TConfig extends BaseChartConfig>(
  config: TConfig,
  defaults?: DeepPartial<TConfig>,
): TConfig {
  if (defaults === undefined) {
    return { ...config };
  }

  return deepMerge(defaults as TConfig, config as DeepPartial<TConfig>);
}

function buildAxisConfig(
  axis: AxisConfig | undefined,
  legacy: AxisConfig,
): AxisConfig {
  return {
    ...legacy,
    ...axis,
  };
}

function resolveAxes(config: BaseChartConfig): AxesConfig {
  const xLegacyTicks = config.axes?.x?.ticks ?? config.xAxisTicks;

  return {
    x: buildAxisConfig(config.axes?.x, {
      axisLabel: config.xAxisLabel,
      domain: config.xDomain,
      tickFormat:
        typeof config.xAxisTickFormat === "string"
          ? config.xAxisTickFormat
          : config.axes?.x?.tickFormat,
      ticks: xLegacyTicks,
    }),
    y: buildAxisConfig(config.axes?.y, {
      axisLabel: config.yAxisLabel,
      domain:
        config.axes?.y?.domain ??
        (config.yDomainMin !== undefined || config.yDomainMax !== undefined
          ? [
              config.yDomainMin ?? "auto",
              config.yDomainMax ?? "auto",
            ]
          : undefined),
      tickFormat: config.axes?.y?.tickFormat ?? config.yAxisNumberFormat,
      ticks: config.yAxisTicks,
    }),
    y2: config.axes?.y2,
  };
}

function resolveData(config: BaseChartConfig): DataConfig {
  return {
    dataUrl: config.data?.dataUrl ?? config.graphicDataURL,
    dateFormat: config.data?.dateFormat,
    format: config.data?.format ?? "auto",
    isDateTime: config.data?.isDateTime,
    rowIdKey: config.data?.rowIdKey,
    source: config.data?.source,
    transform: config.data?.transform,
  };
}

function resolveLayout(config: BaseChartConfig): LayoutConfig {
  const layout = config.layout ?? {};

  return {
    ...DEFAULT_LAYOUT,
    ...layout,
    aspectRatio: layout.aspectRatio ?? config.aspectRatio,
    chartGap: layout.chartGap ?? config.smallMultiple?.chartGap,
    margin: layout.margin ?? config.margin,
    smallMultiple: layout.smallMultiple ?? config.smallMultiple,
    transition: {
      ...DEFAULT_LAYOUT.transition,
      ...layout.transition,
    },
  };
}

function isConfigOverrides(
  overrides: BaseChartConfig["overrides"],
): overrides is ConfigOverrides {
  return typeof overrides === "object" && overrides !== null;
}

function resolveOverrides(config: BaseChartConfig): ConfigOverrides {
  if (typeof config.overrides === "function") {
    return {
      postRender: config.overrides,
    };
  }

  if (isConfigOverrides(config.overrides)) {
    return {
      breakpoints: config.overrides.breakpoints,
      postRender: config.overrides.postRender,
      states: config.overrides.states,
    };
  }

  return {};
}

function resolveBreakpointOverrides(
  config: BaseChartConfig,
  overrides: ConfigOverrides,
): BreakpointOverrides | undefined {
  if (config.breakpoints === undefined && overrides.breakpoints === undefined) {
    return undefined;
  }

  return deepMerge(overrides.breakpoints ?? {}, config.breakpoints ?? {});
}

function resolveAccessibility(
  config: BaseChartConfig,
  typeFallback?: string,
): ResolvedAccessibilityConfig {
  const accessibility = deepMerge(DEFAULT_ACCESSIBILITY, config.accessibility ?? {});
  const ariaLabel =
    accessibility.ariaLabel ??
    config.accessibleSummary ??
    config.sourceText ??
    `${config.type ?? typeFallback ?? "generic"} chart`;
  const tableCaption =
    accessibility.table?.caption ??
    config.accessibleSummary ??
    `${ariaLabel} data table`;

  return {
    ariaDescription: accessibility.ariaDescription,
    ariaLabel,
    role: accessibility.role ?? "img",
    table: {
      caption: tableCaption,
      hideAt: accessibility.table?.hideAt ?? ["sm"],
    },
    touchTargetMinSize: accessibility.touchTargetMinSize ?? 44,
  };
}

export function resolveChartConfig<TConfig extends BaseChartConfig>(
  config: TConfig,
  options: {
    defaults?: DeepPartial<TConfig>;
    typeFallback?: string;
  } = {},
): ResolvedChartConfig<TConfig> {
  const mergedConfig = mergeDefaults(config, options.defaults);
  const overrides = resolveOverrides(mergedConfig);

  return {
    ...mergedConfig,
    accessibility: resolveAccessibility(mergedConfig, options.typeFallback),
    axes: resolveAxes(mergedConfig),
    breakpoints: resolveBreakpointOverrides(mergedConfig, overrides),
    controls: mergedConfig.controls ?? [],
    data: resolveData(mergedConfig),
    layout: resolveLayout(mergedConfig),
    overrides,
    plugins: mergedConfig.plugins ?? [],
    series: mergedConfig.series ?? [],
    type: mergedConfig.type ?? options.typeFallback ?? "generic",
  };
}

export default resolveChartConfig;
