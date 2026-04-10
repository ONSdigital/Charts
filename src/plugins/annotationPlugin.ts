import { select, type Selection } from "d3-selection";

import { applySeriesStyle } from "../core";
import type {
  AnnotationConfig,
  AnnotationStyle,
  ChartPlugin,
  ChartScale,
  ChartScaleState,
} from "../types";

function resolveNumericPosition(value: unknown, axisLabel: string): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }

  throw new Error(`Annotation ${axisLabel} must resolve to a numeric pixel position.`);
}

function resolveScaledPosition(
  scale: ChartScale | undefined,
  value: unknown,
  axisLabel: string,
): number {
  if (scale === undefined) {
    throw new Error(`Annotation requires a ${axisLabel} scale, but none was provided.`);
  }

  const scaled = scale(value);

  if (scaled === undefined || Number.isNaN(scaled)) {
    throw new Error(`Annotation ${axisLabel} value "${String(value)}" could not be resolved.`);
  }

  return scaled + (typeof scale.bandwidth === "function" ? scale.bandwidth() / 2 : 0);
}

function resolveXPosition(
  annotation: AnnotationConfig,
  scales: ChartScaleState | undefined,
  value: unknown,
): number {
  return annotation.xAxis === "x"
    ? resolveScaledPosition(scales?.x, value, "x")
    : resolveNumericPosition(value, "x");
}

function resolveYPosition(
  annotation: AnnotationConfig,
  scales: ChartScaleState | undefined,
  value: unknown,
): number {
  return annotation.yAxis !== undefined
    ? resolveScaledPosition(scales?.[annotation.yAxis], value, annotation.yAxis)
    : resolveNumericPosition(value, "y");
}

function applyTextStyle(
  selection: Selection<SVGTextElement, string, any, any>,
  style: AnnotationStyle = {},
): void {
  const fill = style.fill ?? style.color ?? style.stroke;

  if (fill !== undefined) {
    selection.attr("fill", fill);
  }

  if (style.fontSize !== undefined) {
    selection.attr("font-size", style.fontSize);
  }

  if (style.opacity !== undefined) {
    selection.attr("opacity", style.opacity);
  }

  if (style.textAnchor !== undefined) {
    selection.attr("text-anchor", style.textAnchor);
  }
}

function renderAnnotationLabel(options: {
  annotation: AnnotationConfig;
  element: SVGGElement;
  text: string;
  x: number;
  y: number;
}): void {
  const text = select(options.element)
    .selectAll<SVGTextElement, string>("text.ons-charts-annotation__label")
    .data([options.text])
    .join("text")
    .attr("class", "ons-charts-annotation__label")
    .attr("x", options.x)
    .attr("y", options.y);

  applyTextStyle(text, options.annotation.style);
  text.text((value) => value);
}

export const annotationPlugin: ChartPlugin = {
  name: "annotation",
  onRender(chart) {
    const layer = select(chart.dom.layers.annotations);
    const annotations = chart.config.annotations ?? [];
    const scales = chart.getPluginState<ChartScaleState>("scales");

    const groups = layer
      .selectAll<SVGGElement, AnnotationConfig>("g.ons-charts-annotation")
      .data(annotations, (annotation, index) => annotation.id ?? `${annotation.type}-${index}`);

    groups.exit().remove();

    const mergedGroups = groups
      .join("g")
      .attr("class", (annotation) =>
        [
          "ons-charts-annotation",
          `ons-charts-annotation--${annotation.type}`,
          annotation.className,
          annotation.style?.className,
        ]
          .filter(Boolean)
          .join(" "),
      );

    mergedGroups.each(function renderEach(annotation) {
      const group = select(this);

      group.selectAll("*").remove();

      if (annotation.type === "line") {
        const line = group.append("line").attr("class", "ons-charts-annotation__line");

        if (annotation.axis !== undefined && annotation.value !== undefined) {
          const position =
            annotation.axis === "x"
              ? resolveScaledPosition(scales?.x, annotation.value, "x")
              : resolveScaledPosition(scales?.[annotation.axis], annotation.value, annotation.axis);

          if (annotation.axis === "x") {
            line
              .attr("x1", position)
              .attr("x2", position)
              .attr("y1", 0)
              .attr("y2", chart.frame.innerHeight);
          } else {
            line
              .attr("x1", 0)
              .attr("x2", chart.frame.innerWidth)
              .attr("y1", position)
              .attr("y2", position);
          }

          applySeriesStyle(line, annotation.style);

          if (annotation.label !== undefined) {
            renderAnnotationLabel({
              annotation,
              element: this,
              text: annotation.label,
              x: annotation.axis === "x" ? position + 6 : chart.frame.innerWidth,
              y: annotation.axis === "x" ? 14 : position - 6,
            });
          }

          return;
        }

        if (
          annotation.x === undefined ||
          annotation.x2 === undefined ||
          annotation.y === undefined ||
          annotation.y2 === undefined
        ) {
          throw new Error(
            `Line annotation "${annotation.id ?? annotation.label ?? "unnamed"}" requires either axis/value or x/x2/y/y2 coordinates.`,
          );
        }

        line
          .attr("x1", resolveXPosition(annotation, scales, annotation.x))
          .attr("x2", resolveXPosition(annotation, scales, annotation.x2))
          .attr("y1", resolveYPosition(annotation, scales, annotation.y))
          .attr("y2", resolveYPosition(annotation, scales, annotation.y2));
        applySeriesStyle(line, annotation.style);
        return;
      }

      if (annotation.type === "band") {
        const rect = group.append("rect").attr("class", "ons-charts-annotation__band");

        if (
          annotation.axis !== undefined &&
          annotation.from !== undefined &&
          annotation.to !== undefined
        ) {
          if (annotation.axis === "x") {
            const start = resolveScaledPosition(scales?.x, annotation.from, "x");
            const end = resolveScaledPosition(scales?.x, annotation.to, "x");

            rect
              .attr("x", Math.min(start, end))
              .attr("y", 0)
              .attr("width", Math.abs(end - start))
              .attr("height", chart.frame.innerHeight);
          } else {
            const start = resolveScaledPosition(scales?.[annotation.axis], annotation.from, annotation.axis);
            const end = resolveScaledPosition(scales?.[annotation.axis], annotation.to, annotation.axis);

            rect
              .attr("x", 0)
              .attr("y", Math.min(start, end))
              .attr("width", chart.frame.innerWidth)
              .attr("height", Math.abs(end - start));
          }
        } else {
          if (
            annotation.x === undefined ||
            annotation.x2 === undefined ||
            annotation.y === undefined ||
            annotation.y2 === undefined
          ) {
            throw new Error(
              `Band annotation "${annotation.id ?? annotation.label ?? "unnamed"}" requires either axis/from/to or x/x2/y/y2 coordinates.`,
            );
          }

          const startX = resolveXPosition(annotation, scales, annotation.x);
          const endX = resolveXPosition(annotation, scales, annotation.x2);
          const startY = resolveYPosition(annotation, scales, annotation.y);
          const endY = resolveYPosition(annotation, scales, annotation.y2);

          rect
            .attr("x", Math.min(startX, endX))
            .attr("y", Math.min(startY, endY))
            .attr("width", Math.abs(endX - startX))
            .attr("height", Math.abs(endY - startY));
        }

        applySeriesStyle(rect, {
          fill: annotation.style?.fill ?? annotation.style?.color ?? "currentColor",
          opacity: annotation.style?.opacity ?? 0.15,
          stroke: annotation.style?.stroke ?? annotation.style?.color,
          strokeDasharray: annotation.style?.strokeDasharray,
          strokeWidth: annotation.style?.strokeWidth,
        });

        if (annotation.label !== undefined) {
          const rectNode = rect.node();

          if (rectNode === null) {
            return;
          }

          const bounds = rectNode.getBBox();

          renderAnnotationLabel({
            annotation,
            element: this,
            text: annotation.label,
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
          });
        }

        return;
      }

      if (annotation.x === undefined || annotation.y === undefined) {
        throw new Error(
          `Label annotation "${annotation.id ?? annotation.label ?? "unnamed"}" requires x and y coordinates.`,
        );
      }

      renderAnnotationLabel({
        annotation,
        element: this,
        text: annotation.label ?? "",
        x: resolveXPosition(annotation, scales, annotation.x),
        y: resolveYPosition(annotation, scales, annotation.y),
      });
    });
  },
};

export default annotationPlugin;
