import type { BaseChartConfig, ChartDefinition } from "../types";

const chartDefinitions = new Map<string, ChartDefinition>();

function normaliseDefinitions(
  input: ChartDefinition | readonly ChartDefinition[],
): readonly ChartDefinition[] {
  if (Array.isArray(input)) {
    return input as readonly ChartDefinition[];
  }

  return [input as ChartDefinition];
}

export function registerChart<TConfig extends BaseChartConfig>(
  input: ChartDefinition<TConfig> | readonly ChartDefinition<TConfig>[],
): void {
  normaliseDefinitions(input as readonly ChartDefinition[]).forEach((definition) => {
    chartDefinitions.set(definition.id, definition);
  });
}

export function unregisterChart(
  input: string | ChartDefinition | readonly (string | ChartDefinition)[],
): void {
  const entries = Array.isArray(input) ? input : [input];

  entries.forEach((entry) => {
    chartDefinitions.delete(typeof entry === "string" ? entry : entry.id);
  });
}

export function getChartDefinition<TConfig extends BaseChartConfig = BaseChartConfig>(
  id: string,
): ChartDefinition<TConfig> | undefined {
  return chartDefinitions.get(id) as ChartDefinition<TConfig> | undefined;
}

export function getRegisteredCharts(): readonly ChartDefinition[] {
  return Array.from(chartDefinitions.values());
}
