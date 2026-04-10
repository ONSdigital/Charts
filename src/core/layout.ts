import type { ChartMargin, ResolvedChartFrame } from "../types";

const FALLBACK_ASPECT_RATIO: readonly [number, number] = [1, 1];

export function normaliseAspectRatio(
  aspectRatio?: number | readonly [number, number],
): readonly [number, number] {
  if (Array.isArray(aspectRatio) && aspectRatio.length === 2) {
    const [width, height] = aspectRatio;

    if (width > 0 && height > 0) {
      return [width, height];
    }
  }

  if (typeof aspectRatio === "number" && aspectRatio > 0) {
    return [aspectRatio, 1];
  }

  return FALLBACK_ASPECT_RATIO;
}

export function createChartFrame(options: {
  aspectRatio?: number | readonly [number, number];
  containerWidth: number;
  margin: ChartMargin;
}): ResolvedChartFrame {
  const aspectRatio = normaliseAspectRatio(options.aspectRatio);
  const containerWidth = Math.max(options.containerWidth, 0);
  const innerWidth = Math.max(
    containerWidth - options.margin.left - options.margin.right,
    0,
  );
  const innerHeight = Math.round((aspectRatio[1] / aspectRatio[0]) * innerWidth);
  const containerHeight =
    innerHeight + options.margin.top + options.margin.bottom;

  return {
    aspectRatio,
    containerHeight,
    containerWidth,
    innerHeight,
    innerWidth,
    margin: options.margin,
  };
}
