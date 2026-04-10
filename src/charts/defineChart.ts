import type { BaseChartConfig, ChartDefinition } from "../types";

export function defineChart<TConfig extends BaseChartConfig>(
  definition: ChartDefinition<TConfig>,
): ChartDefinition<TConfig> {
  return definition;
}
