import type {
  ChartPlugin,
  ChartPluginEntry,
  PluginConfig,
} from "../types";
import {
  getBuiltInPlugin,
  getGlobalPlugin,
  getRegisteredPlugins,
} from "./registry";

export interface ResolvedPluginInstance {
  name: string;
  options: Record<string, unknown>;
  plugin: ChartPlugin;
}

function isPluginReference(entry: ChartPluginEntry): entry is PluginConfig {
  return typeof entry === "object" && entry !== null && !("onRender" in entry || "onInit" in entry || "onUpdate" in entry || "onDestroy" in entry);
}

function isPluginObject(entry: ChartPluginEntry): entry is ChartPlugin {
  return typeof entry === "object" && entry !== null && "name" in entry && ("onRender" in entry || "onInit" in entry || "onUpdate" in entry || "onDestroy" in entry);
}

function resolvePluginFromName(name: string): ChartPlugin | undefined {
  return getGlobalPlugin(name) ?? getBuiltInPlugin(name);
}

function resolvePluginEntry(entry: ChartPluginEntry): ResolvedPluginInstance | undefined {
  if (typeof entry === "string") {
    const plugin = resolvePluginFromName(entry);

    if (plugin === undefined) {
      throw new Error(`Plugin "${entry}" is not registered or built in.`);
    }

    return {
      name: plugin.name,
      options: {},
      plugin,
    };
  }

  if (isPluginObject(entry)) {
    return {
      name: entry.name,
      options: {},
      plugin: entry,
    };
  }

  const reference = entry as PluginConfig;
  const pluginName =
    reference.name ?? reference.id ?? reference.type ?? reference.plugin?.name;

  if (pluginName === undefined) {
    throw new Error("Plugin config entries must include a name, id, type, or plugin instance.");
  }

  if (reference.enabled === false) {
    return undefined;
  }

  const plugin = reference.plugin ?? resolvePluginFromName(pluginName);

  if (plugin === undefined) {
    throw new Error(`Plugin "${pluginName}" is not registered or built in.`);
  }

  return {
    name: plugin.name,
    options: reference.options ?? {},
    plugin,
  };
}

export function resolveChartPlugins(
  entries: readonly ChartPluginEntry[] = [],
): readonly ResolvedPluginInstance[] {
  const resolved = new Map<string, ResolvedPluginInstance>(
    getRegisteredPlugins().map((plugin) => [
      plugin.name,
      {
        name: plugin.name,
        options: {},
        plugin,
      },
    ]),
  );

  entries.forEach((entry) => {
    const resolvedEntry = resolvePluginEntry(entry);

    if (resolvedEntry === undefined) {
      if (typeof entry === "object" && entry !== null && isPluginReference(entry)) {
        const pluginName = entry.name ?? entry.id ?? entry.type ?? entry.plugin?.name;

        if (pluginName !== undefined) {
          resolved.delete(pluginName);
        }
      }

      return;
    }

    const existing = resolved.get(resolvedEntry.name);

    resolved.set(resolvedEntry.name, {
      ...resolvedEntry,
      options: {
        ...(existing?.options ?? {}),
        ...resolvedEntry.options,
      },
    });
  });

  return Array.from(resolved.values());
}
