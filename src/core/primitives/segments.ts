import type { BaseType, Selection } from "d3-selection";

import { deepMerge } from "../../theme/mergeTheme";
import type {
  NormalizedDataRow,
  Primitive,
  SeriesConfig,
  SeriesSegmentConfig,
  SeriesSegmentSlice,
  SeriesStyle,
} from "../../types";

function normalizeDashArray(
  dashArray: SeriesStyle["dashArray"] | SeriesStyle["strokeDasharray"],
): string | undefined {
  if (dashArray === undefined) {
    return undefined;
  }

  return typeof dashArray === "string" ? dashArray : dashArray.join(" ");
}

function matchesBoundaryValue(candidate: unknown, boundary: Primitive): boolean {
  if (candidate === boundary) {
    return true;
  }

  if (candidate instanceof Date) {
    return String(candidate.getTime()) === String(boundary);
  }

  if (boundary === null) {
    return candidate === null;
  }

  return String(candidate) === String(boundary);
}

function resolveBoundaryKeys(series: SeriesConfig): string[] {
  return Array.from(
    new Set(
      [series.xKey, series.key, series.valueKey, series.yKey].filter(
        (value): value is string => value !== undefined && value.length > 0,
      ),
    ),
  );
}

export function applySeriesStyle<TElement extends BaseType>(
  selection: Selection<TElement, unknown, BaseType, unknown>,
  style: SeriesStyle = {},
): Selection<TElement, unknown, BaseType, unknown> {
  const stroke = style.stroke ?? style.color;
  const fill = style.fill ?? (style.stroke === undefined ? style.color : undefined);
  const dashArray = normalizeDashArray(style.strokeDasharray ?? style.dashArray);

  if (style.className !== undefined) {
    selection.classed(style.className, true);
  }

  if (stroke !== undefined) {
    selection.attr("stroke", stroke);
  }

  if (fill !== undefined) {
    selection.attr("fill", fill);
  }

  if (style.opacity !== undefined) {
    selection.attr("opacity", style.opacity);
  }

  if (style.strokeWidth !== undefined) {
    selection.attr("stroke-width", style.strokeWidth);
  }

  if (dashArray !== undefined) {
    selection.attr("stroke-dasharray", dashArray);
  }

  return selection;
}

export function resolveSegmentBoundaryIndex(
  rows: readonly NormalizedDataRow[],
  series: SeriesConfig,
  segment: SeriesSegmentConfig,
  boundary: "from" | "to",
): number | undefined {
  const indexKey = boundary === "from" ? "fromIndex" : "toIndex";
  const valueKey = boundary === "from" ? "from" : "to";
  const explicitIndex = segment[indexKey];

  if (explicitIndex !== undefined) {
    const clampedIndex = Math.max(0, Math.min(rows.length - 1, explicitIndex));
    return Number.isFinite(clampedIndex) ? clampedIndex : undefined;
  }

  const boundaryValue = segment[valueKey];

  if (boundaryValue === undefined) {
    return undefined;
  }

  const keys = resolveBoundaryKeys(series);

  return rows.findIndex((row) =>
    (keys.length > 0 ? keys : Object.keys(row)).some((key) =>
      matchesBoundaryValue(row[key], boundaryValue),
    ),
  );
}

export function resolveSeriesSegments(
  rows: readonly NormalizedDataRow[],
  series: SeriesConfig,
): readonly SeriesSegmentSlice[] {
  if (rows.length === 0) {
    return [];
  }

  const baseStyle = series.style ?? {};
  const configuredSegments = (series.segments ?? [])
    .map((segment, index) => ({
      endIndex: resolveSegmentBoundaryIndex(rows, series, segment, "to"),
      id: segment.id ?? `${series.id}-segment-${index + 1}`,
      startIndex: resolveSegmentBoundaryIndex(rows, series, segment, "from"),
      style: deepMerge(baseStyle, segment.style ?? {}),
    }))
    .filter(
      (segment): segment is {
        endIndex: number | undefined;
        id: string;
        startIndex: number;
        style: SeriesStyle;
      } => segment.startIndex !== undefined && segment.startIndex >= 0,
    )
    .sort((left, right) => left.startIndex - right.startIndex);

  if (configuredSegments.length === 0) {
    return [
      {
        endIndex: rows.length - 1,
        id: `${series.id}-segment-base`,
        rows,
        startIndex: 0,
        style: baseStyle,
      },
    ];
  }

  const segments: SeriesSegmentSlice[] = [];
  let cursor = 0;

  configuredSegments.forEach((segment, index) => {
    const nextStartIndex = configuredSegments[index + 1]?.startIndex ?? rows.length;
    const endIndex = Math.min(
      segment.endIndex ?? nextStartIndex - 1,
      nextStartIndex - 1,
      rows.length - 1,
    );

    if (segment.startIndex > cursor) {
      segments.push({
        endIndex: segment.startIndex - 1,
        id: `${series.id}-segment-base-${cursor}`,
        rows: rows.slice(cursor, segment.startIndex),
        startIndex: cursor,
        style: baseStyle,
      });
    }

    if (endIndex >= segment.startIndex) {
      segments.push({
        endIndex,
        id: segment.id,
        rows: rows.slice(segment.startIndex, endIndex + 1),
        startIndex: segment.startIndex,
        style: segment.style,
      });
      cursor = endIndex + 1;
    }
  });

  if (cursor < rows.length) {
    segments.push({
      endIndex: rows.length - 1,
      id: `${series.id}-segment-base-tail`,
      rows: rows.slice(cursor),
      startIndex: cursor,
      style: baseStyle,
    });
  }

  return segments;
}
