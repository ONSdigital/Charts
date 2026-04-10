import { select } from "d3-selection";
import { transition } from "d3-transition";

import type {
  ChartDom,
  ChartDomLayerName,
  ChartMotionSettings,
  ChartRenderReason,
  ResolvedChartFrame,
} from "../types";

const LAYER_NAMES = [
  "background",
  "grid",
  "plot",
  "annotations",
  "overlay",
] as const satisfies readonly ChartDomLayerName[];

function getRequiredNode<T extends Element>(
  node: T | null,
  selector: string,
): T {
  if (node === null) {
    throw new Error(`Expected chart DOM node for selector "${selector}".`);
  }

  return node;
}

export function joinChartDom(options: {
  container: HTMLElement;
  frame: ResolvedChartFrame;
  id: string;
  motion: ChartMotionSettings;
  reason: ChartRenderReason;
}): ChartDom {
  const host = select(options.container)
    .selectAll<HTMLDivElement, null>("div.ons-charts-root")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-root")
    .attr("data-chart-id", options.id)
    .style("display", "block")
    .style("position", "relative");

  const controlsTop = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-controls--top")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-controls ons-charts-controls--top");

  const figure = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-figure")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-figure")
    .style("position", "relative");

  const svg = figure
    .selectAll<SVGSVGElement, null>("svg.ons-charts-svg")
    .data([null])
    .join("svg")
    .attr("class", "ons-charts-svg");

  const htmlOverlay = figure
    .selectAll<HTMLDivElement, null>("div.ons-charts-html-overlay")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-html-overlay");

  const defs = svg.selectAll<SVGDefsElement, null>("defs").data([null]).join("defs");

  const frameGroup = svg
    .selectAll<SVGGElement, null>("g.ons-charts-frame")
    .data([null])
    .join("g")
    .attr("class", "ons-charts-frame");

  frameGroup
    .selectAll<SVGGElement, ChartDomLayerName>("g.ons-charts-layer")
    .data(LAYER_NAMES, (layer) => layer)
    .join((enter) =>
      enter
        .append("g")
        .attr("class", (layer) => `ons-charts-layer ons-charts-layer--${layer}`),
    );

  const shouldAnimate =
    options.motion.enabled &&
    options.motion.duration > 0 &&
    options.reason !== "initial";

  if (shouldAnimate) {
    const resizeTransition = transition().duration(options.motion.duration);

    svg
      .transition(resizeTransition)
      .attr("width", options.frame.containerWidth)
      .attr("height", options.frame.containerHeight)
      .attr(
        "viewBox",
        `0 0 ${options.frame.containerWidth} ${options.frame.containerHeight}`,
      );

    frameGroup
      .transition(resizeTransition)
      .attr(
        "transform",
        `translate(${options.frame.margin.left},${options.frame.margin.top})`,
      );
  } else {
    svg
      .attr("width", options.frame.containerWidth)
      .attr("height", options.frame.containerHeight)
      .attr(
        "viewBox",
        `0 0 ${options.frame.containerWidth} ${options.frame.containerHeight}`,
      );

    frameGroup.attr(
      "transform",
      `translate(${options.frame.margin.left},${options.frame.margin.top})`,
    );
  }

  const domLayers = Object.fromEntries(
    LAYER_NAMES.map((layerName) => [
      layerName,
      getRequiredNode(
        frameGroup.select<SVGGElement>(`.ons-charts-layer--${layerName}`).node(),
        `.ons-charts-layer--${layerName}`,
      ),
    ]),
  ) as Record<ChartDomLayerName, SVGGElement>;

  const controlsBottom = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-controls--bottom")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-controls ons-charts-controls--bottom");

  const tableWrapper = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-data-table")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-data-table");
  const table = tableWrapper
    .selectAll<HTMLTableElement, null>("table.ons-charts-table")
    .data([null])
    .join("table")
    .attr("class", "ons-charts-table");
  const tableCaption = table
    .selectAll<HTMLTableCaptionElement, null>("caption")
    .data([null])
    .join("caption");

  return {
    controlsBottom: getRequiredNode(
      controlsBottom.node(),
      "div.ons-charts-controls--bottom",
    ),
    controlsTop: getRequiredNode(controlsTop.node(), "div.ons-charts-controls--top"),
    defs: getRequiredNode(defs.node(), "defs"),
    frame: getRequiredNode(frameGroup.node(), "g.ons-charts-frame"),
    figure: getRequiredNode(figure.node(), "div.ons-charts-figure"),
    host: getRequiredNode(host.node(), "div.ons-charts-root"),
    htmlOverlay: getRequiredNode(
      htmlOverlay.node(),
      "div.ons-charts-html-overlay",
    ),
    id: options.id,
    layers: domLayers,
    svg: getRequiredNode(svg.node(), "svg.ons-charts-svg"),
    table: getRequiredNode(table.node(), "table.ons-charts-table"),
    tableCaption: getRequiredNode(tableCaption.node(), "caption"),
    tableWrapper: getRequiredNode(
      tableWrapper.node(),
      "div.ons-charts-data-table",
    ),
  };
}
