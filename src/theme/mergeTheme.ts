import type { ChartTheme, DeepPartial } from "../types";
import { defaultTheme } from "./theme";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as unknown as T;
  }

  if (isPlainObject(value)) {
    const clone: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      clone[key] = cloneValue(entry);
    }

    return clone as T;
  }

  return value;
}

function mergeValues<T>(base: T, override: DeepPartial<T>): T {
  if (Array.isArray(override)) {
    return cloneValue(override as unknown as T);
  }

  if (!isPlainObject(base) || !isPlainObject(override)) {
    return cloneValue(override as unknown as T);
  }

  const baseRecord = base as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...baseRecord };

  for (const [key, overrideValue] of Object.entries(override)) {
    if (overrideValue === undefined) {
      continue;
    }

    const baseValue = baseRecord[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      merged[key] = mergeValues(baseValue, overrideValue);
      continue;
    }

    if (Array.isArray(overrideValue)) {
      merged[key] = cloneValue(overrideValue);
      continue;
    }

    merged[key] = cloneValue(overrideValue);
  }

  return merged as T;
}

export function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  const clonedBase = cloneValue(base);

  if (override === undefined) {
    return clonedBase;
  }

  return mergeValues(clonedBase, override);
}

export function resolveTheme(theme?: DeepPartial<ChartTheme>): ChartTheme {
  return deepMerge<ChartTheme>(defaultTheme, theme);
}
