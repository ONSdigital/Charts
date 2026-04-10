import { select } from "d3-selection";

import type { ChartPlugin } from "../types";

interface TooltipPluginOptions {
  attribute?: string;
  className?: string;
  linkKeyAttribute?: string;
  linked?: boolean;
  offset?: number;
  selector?: string;
}

function resolveTooltipContent(
  target: Element,
  options: TooltipPluginOptions,
): string | undefined {
  const attribute = options.attribute ?? "data-ons-charts-tooltip";

  return (
    target.getAttribute(attribute) ??
    target.getAttribute("aria-label") ??
    target.getAttribute("title") ??
    undefined
  );
}

function resolveLinkKey(
  target: Element,
  options: TooltipPluginOptions,
): string | undefined {
  const attribute = options.linkKeyAttribute ?? "data-ons-charts-link-key";

  return target.getAttribute(attribute) ?? resolveTooltipContent(target, options);
}

function positionTooltip(options: {
  event: Event;
  figure: HTMLDivElement;
  target: Element;
  tooltip: HTMLDivElement;
  tooltipOffset: number;
}): void {
  const figureBounds = options.figure.getBoundingClientRect();
  const targetBounds = options.target.getBoundingClientRect();
  const isFocusEvent = options.event instanceof FocusEvent;
  const clientX = isFocusEvent
    ? targetBounds.left + targetBounds.width / 2
    : (options.event as MouseEvent | PointerEvent).clientX;
  const clientY = isFocusEvent
    ? targetBounds.top
    : (options.event as MouseEvent | PointerEvent).clientY;
  const left = clientX - figureBounds.left;
  const top = clientY - figureBounds.top - options.tooltipOffset;

  options.tooltip.style.left = `${left}px`;
  options.tooltip.style.top = `${top}px`;
}

export const tooltipPlugin: ChartPlugin = {
  name: "tooltip",
  onRender(chart) {
    const pluginOptions = chart.options as TooltipPluginOptions;
    const tooltip = select(chart.dom.htmlOverlay)
      .selectAll<HTMLDivElement, null>("div.ons-charts-tooltip")
      .data([null])
      .join("div")
      .attr(
        "class",
        [
          "ons-charts-tooltip",
          pluginOptions.className,
        ]
          .filter(Boolean)
          .join(" "),
      )
      .attr("role", "tooltip")
      .attr("hidden", true)
      .node();

    if (tooltip === null) {
      throw new Error("Tooltip plugin failed to create its overlay element.");
    }

    const selector = pluginOptions.selector ?? "[data-ons-charts-tooltip]";
    const tooltipOffset = pluginOptions.offset ?? 12;
    const targets = Array.from(chart.dom.figure.querySelectorAll(selector));
    const linkedTargets = new Map<string, Element[]>();
    const linkedEnabled =
      pluginOptions.linked ?? chart.config.linked ?? true;

    targets.forEach((target) => {
      const key = resolveLinkKey(target, pluginOptions);

      if (key === undefined) {
        return;
      }

      const entries = linkedTargets.get(key) ?? [];
      entries.push(target);
      linkedTargets.set(key, entries);
    });

    if (linkedEnabled) {
      const removeHighlight = () => {
        targets.forEach((target) =>
          target.classList.remove("ons-charts-linked-highlight"),
        );
      };
      const unsubscribe = chart.eventBus.on("highlight", (payload) => {
        removeHighlight();

        if (
          payload === undefined ||
          payload.key === undefined ||
          payload.sourceId === chart.dom.id
        ) {
          return;
        }

        linkedTargets.get(payload.key)?.forEach((target) => {
          target.classList.add("ons-charts-linked-highlight");
        });
      });

      chart.registerCleanup(() => {
        removeHighlight();
        unsubscribe();
      });
    }

    targets.forEach((target) => {
      const show = (event: Event) => {
        const content = resolveTooltipContent(target, pluginOptions);

        if (content === undefined || content.length === 0) {
          tooltip.hidden = true;
          return;
        }

        tooltip.textContent = content;
        tooltip.hidden = false;
        positionTooltip({
          event,
          figure: chart.dom.figure,
          target,
          tooltip,
          tooltipOffset,
        });

        if (linkedEnabled) {
          chart.eventBus.emit("highlight", {
            key: resolveLinkKey(target, pluginOptions),
            sourceId: chart.dom.id,
          });
        }
      };
      const hide = () => {
        tooltip.hidden = true;

        if (linkedEnabled) {
          chart.eventBus.emit("highlight", undefined);
        }
      };

      chart.addEventListener(target, "pointerenter", show);
      chart.addEventListener(target, "pointermove", show);
      chart.addEventListener(target, "pointerleave", hide);
      chart.addEventListener(target, "focus", show);
      chart.addEventListener(target, "blur", hide);
    });
  },
};

export default tooltipPlugin;
