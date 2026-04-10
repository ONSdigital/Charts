import type { ChartTheme } from "../types";

const THEME_VARIABLE_PREFIX = "ons-charts";

function buildRuntimeStylesheet(): string {
  return `
.ons-charts-root {
  color: var(--ons-charts-colors-text);
  font-family: var(--ons-charts-typography-font-family);
}

.ons-charts-grid-root {
  color: var(--ons-charts-colors-text);
  font-family: var(--ons-charts-typography-font-family);
}

.ons-charts-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 16px;
}

.ons-charts-controls--bottom {
  margin: 16px 0 0;
}

.ons-charts-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.ons-charts-control__label,
.ons-label {
  color: var(--ons-charts-colors-text);
  font-size: var(--ons-charts-typography-sizes-label);
  font-weight: var(--ons-charts-typography-weights-semibold);
}

.ons-charts-control__select,
.ons-input,
.ons-select {
  background: var(--ons-charts-colors-background);
  border: 1px solid var(--ons-charts-colors-axis);
  border-radius: var(--ons-charts-spacing-radius-card);
  color: var(--ons-charts-colors-text);
  font: inherit;
  min-height: 44px;
  padding: 10px 12px;
}

.ons-charts-control__buttons,
.ons-btn-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ons-charts-control__button,
.ons-btn {
  align-items: center;
  background: var(--ons-charts-colors-background);
  border: 1px solid var(--ons-charts-colors-axis);
  border-radius: var(--ons-charts-spacing-radius-pill);
  color: var(--ons-charts-colors-text);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
}

.ons-charts-control__button--active {
  background: var(--ons-charts-colors-focus);
  border-color: var(--ons-charts-colors-focus);
  color: var(--ons-charts-colors-background);
}

.ons-charts-control__toggle {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  min-height: 44px;
}

.ons-charts-control__checkbox,
.ons-checkbox {
  block-size: 18px;
  inline-size: 18px;
  margin: 0;
}

.ons-charts-figure {
  position: relative;
}

.ons-charts-grid-panels {
  display: grid;
  gap: 16px;
}

.ons-charts-grid-panel {
  min-width: 0;
}

.ons-charts-grid-panel__chart {
  min-width: 0;
}

.ons-charts-html-overlay {
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.ons-charts-tooltip {
  background: rgba(34, 34, 34, 0.92);
  border-radius: var(--ons-charts-spacing-radius-card);
  color: #fff;
  font-size: var(--ons-charts-typography-sizes-small);
  left: 0;
  max-width: 280px;
  padding: 8px 10px;
  position: absolute;
  top: 0;
  transform: translate(-50%, calc(-100% - 4px));
  white-space: normal;
  z-index: 2;
}

.ons-charts-data-table {
  margin-top: 16px;
}

.ons-charts-table {
  border-collapse: collapse;
  inline-size: 100%;
}

.ons-charts-table caption {
  font-weight: var(--ons-charts-typography-weights-semibold);
  margin-bottom: 8px;
  text-align: left;
}

.ons-charts-table th,
.ons-charts-table td {
  border-bottom: 1px solid var(--ons-charts-colors-grid);
  padding: 8px 10px;
  text-align: left;
}

.ons-charts-linked-highlight {
  filter: drop-shadow(0 0 0.25rem rgba(32, 96, 149, 0.4));
  stroke-width: calc(var(--ons-charts-spacing-stroke-widths-series) * 1.4);
}
`.trim();
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

function appendCssVariables(
  value: unknown,
  path: string[],
  variables: Record<string, string>,
  prefix: string,
): void {
  if (Array.isArray(value)) {
    const variableName = `--${prefix}-${path.map(toKebabCase).join("-")}`;
    const primitiveValues = value.filter(
      (entry): entry is string | number | boolean =>
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean",
    );

    if (primitiveValues.length === value.length) {
      variables[variableName] = primitiveValues.map(String).join(", ");
    }

    value.forEach((entry, index) => {
      appendCssVariables(entry, [...path, String(index + 1)], variables, prefix);
    });

    variables[`${variableName}-count`] = String(value.length);
    return;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    variables[`--${prefix}-${path.map(toKebabCase).join("-")}`] = String(value);
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    appendCssVariables(child, [...path, key], variables, prefix);
  }
}

export function themeToCssVariables(
  theme: ChartTheme,
  prefix = THEME_VARIABLE_PREFIX,
): Record<string, string> {
  const variables: Record<string, string> = {};
  appendCssVariables(theme, [], variables, prefix);
  return variables;
}

export function buildThemeStylesheet(
  theme: ChartTheme,
  selector = ":root",
  prefix = THEME_VARIABLE_PREFIX,
): string {
  const declarations = Object.entries(themeToCssVariables(theme, prefix))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${declarations}\n}\n\n${buildRuntimeStylesheet()}`;
}

export function applyThemeVariables(
  theme: ChartTheme,
  element: HTMLElement = document.documentElement,
  prefix = THEME_VARIABLE_PREFIX,
): Record<string, string> {
  const variables = themeToCssVariables(theme, prefix);

  for (const [name, value] of Object.entries(variables)) {
    element.style.setProperty(name, value);
  }

  return variables;
}
