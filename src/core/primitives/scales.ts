import { extent } from "d3-array";
import {
  scaleBand,
  scaleLinear,
  scaleTime,
  type ScaleBand,
  type ScaleLinear,
  type ScaleTime,
} from "d3-scale";

export function resolveNumericDomain(
  values: readonly number[],
  options: {
    includeZero?: boolean;
    max?: number | "auto";
    min?: number | "auto";
    paddingRatio?: number;
  } = {},
): readonly [number, number] {
  const [minValue, maxValue] = extent(values);

  if (minValue === undefined || maxValue === undefined) {
    return [0, 0];
  }

  const includeZero = options.includeZero ?? true;
  const paddingRatio = options.paddingRatio ?? 0.1;
  const resolvedMin =
    options.min === undefined || options.min === "auto" ? minValue : options.min;
  const resolvedMax =
    options.max === undefined || options.max === "auto" ? maxValue : options.max;
  let domainMin = includeZero ? Math.min(0, resolvedMin) : resolvedMin;
  let domainMax = includeZero ? Math.max(0, resolvedMax) : resolvedMax;

  if (domainMin === domainMax) {
    const padding = Math.abs(domainMin || 1) * paddingRatio || 1;
    domainMin -= padding;
    domainMax += padding;
  }

  return [domainMin, domainMax];
}

export function createLinearScale(options: {
  domain?: readonly [number, number];
  nice?: boolean;
  range: readonly [number, number];
  values?: readonly number[];
}): ScaleLinear<number, number> {
  const resolvedDomain =
    options.domain ?? resolveNumericDomain(options.values ?? []);
  const scale = scaleLinear<number>()
    .domain(resolvedDomain)
    .range(options.range);

  if (options.nice ?? true) {
    scale.nice();
  }

  return scale;
}

export function createBandScale<Domain extends string>(options: {
  domain: readonly Domain[];
  paddingInner?: number;
  paddingOuter?: number;
  range: readonly [number, number];
  round?: boolean;
}): ScaleBand<Domain> {
  return scaleBand<Domain>()
    .domain(options.domain)
    .paddingInner(options.paddingInner ?? 0.1)
    .paddingOuter(options.paddingOuter ?? 0.1)
    .range(options.range)
    .round(options.round ?? true);
}

export function createTimeScale(options: {
  domain: readonly [Date, Date];
  nice?: boolean;
  range: readonly [number, number];
}): ScaleTime<number, number> {
  const scale = scaleTime<number, number>()
    .domain(options.domain)
    .range(options.range);

  if (options.nice ?? false) {
    scale.nice();
  }

  return scale;
}
