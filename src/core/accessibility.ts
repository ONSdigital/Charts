import { select } from "d3-selection";
import type { BaseType, Selection } from "d3-selection";

import type {
  BreakpointKey,
  ChartDom,
  NormalizedDataRow,
  NormalizedDataset,
  ResolvedChartConfig,
} from "../types";

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function applyVisuallyHiddenStyles(element: HTMLDivElement, hidden: boolean): void {
  const styles = {
    border: hidden ? "0" : "",
    clip: hidden ? "rect(0 0 0 0)" : "",
    height: hidden ? "1px" : "",
    margin: hidden ? "-1px" : "",
    overflow: hidden ? "hidden" : "",
    padding: hidden ? "0" : "",
    position: hidden ? "absolute" : "",
    whiteSpace: hidden ? "nowrap" : "",
    width: hidden ? "1px" : "",
  } as const;

  Object.entries(styles).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

function renderTableRows(
  table: HTMLTableElement,
  columns: readonly string[],
  rows: readonly NormalizedDataRow[],
): void {
  const tableSelection = select(table);
  const headerRow = tableSelection
    .selectAll<HTMLTableSectionElement, readonly string[]>("thead")
    .data([columns])
    .join("thead")
    .selectAll<HTMLTableRowElement, readonly string[]>("tr")
    .data((currentColumns) => [currentColumns])
    .join("tr");

  headerRow
    .selectAll<HTMLTableCellElement, string>("th")
    .data((currentColumns) => currentColumns, (column) => column)
    .join("th")
    .attr("scope", "col")
    .text((column) => column);

  const body = tableSelection
    .selectAll<HTMLTableSectionElement, readonly NormalizedDataRow[]>("tbody")
    .data([rows])
    .join("tbody");

  const bodyRows = body
    .selectAll<HTMLTableRowElement, NormalizedDataRow>("tr")
    .data(rows, (row) => row.__rowId)
    .join("tr");

  bodyRows
    .selectAll<HTMLTableCellElement, { column: string; value: unknown }>("td")
    .data(
      (row) =>
        columns.map((column) => ({
          column,
          value: row[column],
        })),
      (cell) => cell.column,
    )
    .join("td")
    .text((cell) => formatCellValue(cell.value));
}

export function applyChartAccessibility(options: {
  breakpoint: BreakpointKey;
  config: ResolvedChartConfig;
  data: NormalizedDataset;
  dom: ChartDom;
}): void {
  const svg = select(options.dom.svg);
  const titleId = `${options.dom.id}-title`;
  const descriptionId = `${options.dom.id}-description`;
  const hasDescription = options.config.accessibility.ariaDescription !== undefined;
  const hideTable = options.config.accessibility.table.hideAt.includes(options.breakpoint);

  select(options.dom.host)
    .attr("data-breakpoint", options.breakpoint)
    .attr("data-chart-type", options.config.type);

  svg
    .attr("aria-label", options.config.accessibility.ariaLabel)
    .attr("role", options.config.accessibility.role)
    .attr("aria-labelledby", titleId)
    .attr("aria-describedby", hasDescription ? descriptionId : null);

  svg
    .selectAll<SVGTitleElement, string>("title.ons-charts-title")
    .data([options.config.accessibility.ariaLabel])
    .join("title")
    .attr("class", "ons-charts-title")
    .attr("id", titleId)
    .text((label) => label);

  svg
    .selectAll<SVGDescElement, string>("desc.ons-charts-description")
    .data(
      hasDescription ? [options.config.accessibility.ariaDescription ?? ""] : [],
    )
    .join("desc")
    .attr("class", "ons-charts-description")
    .attr("id", descriptionId)
    .text((description) => description);

  select(options.dom.tableCaption).text(options.config.accessibility.table.caption);
  applyVisuallyHiddenStyles(options.dom.tableWrapper, hideTable);
  renderTableRows(options.dom.table, options.data.columns, options.data.rows);
}

export function ensureMinimumTouchTargetGroups(
  selection: Selection<SVGGElement, unknown, BaseType, unknown>,
  minimumSize = 44,
): void {
  selection.each(function applyTouchTarget() {
    const group = select(this);

    group.selectAll<SVGRectElement, null>("rect.ons-charts-touch-target").remove();

    const box = this.getBBox();
    const width = Math.max(box.width, minimumSize);
    const height = Math.max(box.height, minimumSize);
    const x = box.x - (width - box.width) / 2;
    const y = box.y - (height - box.height) / 2;

    group
      .insert("rect", ":first-child")
      .attr("class", "ons-charts-touch-target")
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("pointer-events", "all");
  });
}
