import { csvParse } from "d3-dsv";

import type {
  ChartDataInput,
  DataRow,
  NormalizedDataRow,
  NormalizedDataset,
  NormalizedInputKind,
  NormalizedSeries,
  RemoteDataFormat,
  ResolvedChartConfig,
  SeriesConfig,
} from "../types";

function hasColumnsProperty(
  rows: readonly DataRow[],
): rows is Array<DataRow> & { columns?: readonly string[] } {
  return "columns" in rows;
}

function resolveColumns(rows: readonly DataRow[], fallback?: readonly string[]): string[] {
  const seen = new Set<string>();
  const columns: string[] = [];

  for (const key of fallback ?? []) {
    if (!seen.has(key)) {
      seen.add(key);
      columns.push(key);
    }
  }

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key.startsWith("__")) {
        continue;
      }

      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  return columns;
}

function normalizeRows(
  rows: readonly DataRow[],
  rowIdKey?: string,
): NormalizedDataRow[] {
  return rows.map((row, index) => {
    const explicitRowId =
      rowIdKey !== undefined && typeof row[rowIdKey] === "string"
        ? (row[rowIdKey] as string)
        : rowIdKey !== undefined && typeof row[rowIdKey] === "number"
          ? String(row[rowIdKey])
          : undefined;

    return {
      ...row,
      __rowId: explicitRowId ?? `row-${index}`,
      __rowIndex: index,
    };
  });
}

function resolveSeriesKey(series: SeriesConfig): string {
  return series.key ?? series.valueKey ?? series.yKey ?? series.id;
}

function buildSeries(
  rows: readonly NormalizedDataRow[],
  series: readonly SeriesConfig[],
): readonly NormalizedSeries[] {
  return series.map((seriesConfig) => {
    const key = resolveSeriesKey(seriesConfig);

    return {
      axis: seriesConfig.axis ?? "y",
      id: seriesConfig.id,
      key,
      label: seriesConfig.label ?? seriesConfig.id,
      segments: seriesConfig.segments ?? [],
      style: seriesConfig.style ?? {},
      values: rows.map((row) => row[key]),
    };
  });
}

function buildDataset(options: {
  columns?: readonly string[];
  config: ResolvedChartConfig;
  kind: NormalizedInputKind;
  resolvedFormat: RemoteDataFormat;
  rows: readonly DataRow[];
}): NormalizedDataset {
  const normalizedRows = normalizeRows(options.rows, options.config.data.rowIdKey);
  const columns = resolveColumns(normalizedRows, options.columns);

  return {
    columns,
    input: {
      dataUrl: options.config.data.dataUrl,
      format: options.resolvedFormat,
      kind: options.kind,
    },
    rowCount: normalizedRows.length,
    rows: normalizedRows,
    series: buildSeries(normalizedRows, options.config.series),
  };
}

export function rebuildDataset(options: {
  columns?: readonly string[];
  config: ResolvedChartConfig;
  input: NormalizedDataset["input"];
  rows: readonly DataRow[];
}): NormalizedDataset {
  return buildDataset({
    columns: options.columns,
    config: options.config,
    kind: options.input.kind,
    resolvedFormat: options.input.format,
    rows: options.rows,
  });
}

function inferStringFormat(
  value: string,
  configuredFormat: RemoteDataFormat,
): Exclude<RemoteDataFormat, "auto" | "rows"> {
  if (configuredFormat === "csv" || configuredFormat === "json") {
    return configuredFormat;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("[") || trimmedValue.startsWith("{")) {
    return "json";
  }

  return "csv";
}

function normalizeJsonRows(value: unknown): readonly DataRow[] {
  if (Array.isArray(value)) {
    return value as readonly DataRow[];
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "rows" in value &&
    Array.isArray((value as { rows: unknown }).rows)
  ) {
    return (value as { rows: readonly DataRow[] }).rows;
  }

  throw new Error("JSON data sources must resolve to an array of objects or an object with a rows array.");
}

async function fetchRemoteSource(
  config: ResolvedChartConfig,
  fetcher?: typeof fetch,
): Promise<{
  kind: NormalizedInputKind;
  resolvedFormat: Exclude<RemoteDataFormat, "auto" | "rows">;
  rows: readonly DataRow[];
}> {
  const dataUrl = config.data.dataUrl;

  if (dataUrl === undefined) {
    throw new Error("Remote fetch requested without a dataUrl.");
  }

  const activeFetcher = fetcher ?? globalThis.fetch;

  if (activeFetcher === undefined) {
    throw new Error("No fetch implementation is available for remote data loading.");
  }

  const response = await activeFetcher(dataUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch chart data from ${dataUrl}: ${response.status} ${response.statusText}`);
  }

  const configuredFormat = config.data.format ?? "auto";
  const contentType = response.headers.get("content-type") ?? "";
  const looksJson =
    configuredFormat === "json" ||
    (configuredFormat === "auto" &&
      (contentType.includes("application/json") || dataUrl.endsWith(".json")));

  if (looksJson) {
    return {
      kind: "remote-json",
      resolvedFormat: "json",
      rows: normalizeJsonRows(await response.json()),
    };
  }

  return {
    kind: "remote-csv",
    resolvedFormat: "csv",
    rows: csvParse(await response.text()) as unknown as readonly DataRow[],
  };
}

function parseInlineSource(
  source: ChartDataInput,
  config: ResolvedChartConfig,
): {
  columns?: readonly string[];
  kind: NormalizedInputKind;
  resolvedFormat: RemoteDataFormat;
  rows: readonly DataRow[];
} {
  if (typeof source === "string") {
    const resolvedFormat = inferStringFormat(source, config.data.format ?? "auto");

    if (resolvedFormat === "json") {
      return {
        kind: "json",
        resolvedFormat,
        rows: normalizeJsonRows(JSON.parse(source)),
      };
    }

    const parsed = csvParse(source) as unknown as Array<DataRow> & {
      columns?: readonly string[];
    };

    return {
      columns: parsed.columns,
      kind: "csv",
      resolvedFormat,
      rows: parsed,
    };
  }

  const clonedRows = source.map((row) => ({ ...row }));

  return {
    columns: hasColumnsProperty(source) ? source.columns : undefined,
    kind: hasColumnsProperty(source) ? "d3-columns" : "rows",
    resolvedFormat: "rows",
    rows: clonedRows,
  };
}

export function createEmptyDataset(
  config: ResolvedChartConfig,
): NormalizedDataset {
  return {
    columns: [],
    input: {
      dataUrl: config.data.dataUrl,
      format: config.data.format ?? "auto",
      kind: "empty",
    },
    rowCount: 0,
    rows: [],
    series: buildSeries([], config.series),
  };
}

export async function parseData(
  options: {
    config: ResolvedChartConfig;
    data?: ChartDataInput;
    fetcher?: typeof fetch;
  },
): Promise<NormalizedDataset> {
  const inlineSource = options.data ?? options.config.data.source;

  if (inlineSource !== undefined) {
    return buildDataset({
      ...parseInlineSource(inlineSource, options.config),
      config: options.config,
    });
  }

  if (options.config.data.dataUrl !== undefined) {
    return buildDataset({
      ...(await fetchRemoteSource(options.config, options.fetcher)),
      config: options.config,
    });
  }

  return createEmptyDataset(options.config);
}

export function transformData(
  dataset: NormalizedDataset,
  options: {
    config: ResolvedChartConfig;
    reason: "initial" | "update" | "resize" | "control";
  },
): NormalizedDataset {
  const transform = options.config.data.transform;
  const transformedRows =
    transform === undefined
      ? dataset.rows
      : transform(dataset.rows, {
          columns: dataset.columns,
          config: options.config,
          reason: options.reason,
          rows: dataset.rows,
        });

  return buildDataset({
    columns: resolveColumns(transformedRows as readonly DataRow[]),
    config: options.config,
    kind: dataset.input.kind,
    resolvedFormat: dataset.input.format,
    rows: transformedRows as readonly DataRow[],
  });
}
