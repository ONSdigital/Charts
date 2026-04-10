import type {
  BaseChartConfig,
  ChartConfigInput,
  ChartPlugin,
  ConditionalConfigContext,
  DynamicConfigInput,
} from "../types";

const NON_CONDITIONAL_FUNCTION_KEYS = new Set([
  "onDestroy",
  "onInit",
  "onRender",
  "onUpdate",
  "plugin",
  "postRender",
  "render",
  "transform",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function isChartPluginObject(value: unknown): value is ChartPlugin {
  return (
    isPlainObject(value) &&
    typeof value.name === "string" &&
    ("onInit" in value ||
      "onRender" in value ||
      "onUpdate" in value ||
      "onDestroy" in value)
  );
}

export function createConditionalConfigContext(
  context: Partial<ConditionalConfigContext> = {},
): ConditionalConfigContext {
  return {
    breakpoint: context.breakpoint,
    column: context.column ?? 0,
    columns: context.columns ?? 1,
    facetField: context.facetField,
    facetValue: context.facetValue,
    index: context.index ?? 0,
    isFirst: context.isFirst ?? true,
    isFirstInRow: context.isFirstInRow ?? true,
    isLast: context.isLast ?? true,
    isLastInRow: context.isLastInRow ?? true,
    panelCount: context.panelCount ?? 1,
    role: context.role ?? "default",
    row: context.row ?? 0,
  };
}

function resolveValue<T>(
  value: DynamicConfigInput<T>,
  context: ConditionalConfigContext,
  key?: string,
): T {
  if (typeof value === "function") {
    if (key !== undefined && NON_CONDITIONAL_FUNCTION_KEYS.has(key)) {
      return value as T;
    }

    return resolveValue(
      (value as (context: ConditionalConfigContext) => unknown)(context) as DynamicConfigInput<T>,
      context,
    );
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      resolveValue(entry as DynamicConfigInput<unknown>, context),
    ) as T;
  }

  if (!isPlainObject(value) || isChartPluginObject(value)) {
    return value as T;
  }

  const resolvedEntries = Object.entries(value).map(([entryKey, entryValue]) => [
    entryKey,
    resolveValue(entryValue as DynamicConfigInput<unknown>, context, entryKey),
  ]);

  return Object.fromEntries(resolvedEntries) as T;
}

export function resolveDynamicConfig<TConfig extends BaseChartConfig>(
  config: ChartConfigInput<TConfig>,
  context: Partial<ConditionalConfigContext> = {},
): TConfig {
  return resolveValue(config, createConditionalConfigContext(context));
}
