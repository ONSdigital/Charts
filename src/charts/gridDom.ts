import { select } from "d3-selection";

function getRequiredNode<T extends Element>(
  node: T | null,
  selector: string,
): T {
  if (node === null) {
    throw new Error(`Expected grid DOM node for selector "${selector}".`);
  }

  return node;
}

export interface GridDom {
  controlsBottom: HTMLDivElement;
  controlsTop: HTMLDivElement;
  host: HTMLDivElement;
  panels: HTMLDivElement;
}

export function joinGridDom(options: {
  container: HTMLElement;
  id: string;
}): GridDom {
  const host = select(options.container)
    .selectAll<HTMLDivElement, null>("div.ons-charts-grid-root")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-grid-root")
    .attr("data-grid-id", options.id);

  const controlsTop = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-grid-controls--top")
    .data([null])
    .join("div")
    .attr(
      "class",
      "ons-charts-grid-controls ons-charts-grid-controls--top ons-charts-controls ons-charts-controls--top",
    );

  const panels = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-grid-panels")
    .data([null])
    .join("div")
    .attr("class", "ons-charts-grid-panels");

  const controlsBottom = host
    .selectAll<HTMLDivElement, null>("div.ons-charts-grid-controls--bottom")
    .data([null])
    .join("div")
    .attr(
      "class",
      "ons-charts-grid-controls ons-charts-grid-controls--bottom ons-charts-controls ons-charts-controls--bottom",
    );

  return {
    controlsBottom: getRequiredNode(
      controlsBottom.node(),
      "div.ons-charts-grid-controls--bottom",
    ),
    controlsTop: getRequiredNode(
      controlsTop.node(),
      "div.ons-charts-grid-controls--top",
    ),
    host: getRequiredNode(host.node(), "div.ons-charts-grid-root"),
    panels: getRequiredNode(panels.node(), "div.ons-charts-grid-panels"),
  };
}
