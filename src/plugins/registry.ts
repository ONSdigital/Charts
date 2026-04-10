import type { ChartPlugin } from "../types";
import { annotationPlugin } from "./annotationPlugin";
import { tooltipPlugin } from "./tooltipPlugin";

const globalPlugins = new Map<string, ChartPlugin>();

const builtInPlugins = new Map<string, ChartPlugin>(
  [annotationPlugin, tooltipPlugin].map((plugin) => [plugin.name, plugin]),
);

function normalisePlugins(
  input: ChartPlugin | readonly ChartPlugin[],
): readonly ChartPlugin[] {
  if (Array.isArray(input)) {
    return input as readonly ChartPlugin[];
  }

  return [input as ChartPlugin];
}

export function register(
  input: ChartPlugin | readonly ChartPlugin[],
): void {
  normalisePlugins(input).forEach((plugin) => {
    globalPlugins.set(plugin.name, plugin);
  });
}

export function unregister(
  input: string | ChartPlugin | readonly (string | ChartPlugin)[],
): void {
  const entries = Array.isArray(input) ? input : [input];

  entries.forEach((entry) => {
    globalPlugins.delete(typeof entry === "string" ? entry : entry.name);
  });
}

export function getRegisteredPlugins(): readonly ChartPlugin[] {
  return Array.from(globalPlugins.values());
}

export function getGlobalPlugin(name: string): ChartPlugin | undefined {
  return globalPlugins.get(name);
}

export function getBuiltInPlugin(name: string): ChartPlugin | undefined {
  return builtInPlugins.get(name);
}

export const registerPlugin = register;
export const unregisterPlugin = unregister;
