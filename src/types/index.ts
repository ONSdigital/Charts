import type { BaseType, Selection } from "d3-selection";

export type BreakpointKey = "sm" | "md" | "lg";
export type NumericLike = number | string;
export type Primitive = string | number | boolean | null;
export type ConfigValue =
  | Primitive
  | readonly ConfigValue[]
  | { [key: string]: ConfigValue };
export type GridPanelRole = "default" | "focus" | "context";
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey, T>>;
export type RootSelection = Selection<any, unknown, null, undefined>;

export interface ConditionalConfigContext {
  breakpoint?: BreakpointKey;
  column: number;
  columns: number;
  facetField?: string;
  facetValue?: Primitive;
  index: number;
  isFirst: boolean;
  isFirstInRow: boolean;
  isLast: boolean;
  isLastInRow: boolean;
  panelCount: number;
  role: GridPanelRole;
  row: number;
}

export type ConditionalConfigResolver<T> = (
  context: ConditionalConfigContext,
) => T;

export type DynamicConfigInput<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer U)[]
      ? readonly DynamicConfigInput<U>[]
      : T extends Array<infer U>
        ? DynamicConfigInput<U>[]
        : T extends object
          ? { [K in keyof T]: DynamicConfigInput<T[K]> } | ConditionalConfigResolver<T>
          : T | ConditionalConfigResolver<T>;

export type DeepPartial<T> =
  T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer U)[]
      ? readonly U[]
      : T extends Array<infer U>
        ? U[]
        : T extends object
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : T;

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartMarginPreset extends Partial<Record<BreakpointKey, ChartMargin>> {
  [key: string]: ChartMargin | NumericLike | undefined;
}

export interface Breakpoints {
  mobile: number;
  medium: number;
}

export interface ThemeColors {
  tokens: Record<string, string>;
  inline: Record<string, string>;
  series: readonly string[];
  seriesText: readonly string[];
  grid: string;
  axis: string;
  text: string;
  textMuted: string;
  background: string;
  focus: string;
  noData: string;
  positive: string;
  negative: string;
  zeroLine: string;
  categorical: Record<string, readonly string[]>;
  sequential: Record<string, Record<string, readonly string[]>>;
  diverging: Record<string, Record<string, readonly string[]>>;
  sex: {
    female: string;
    femaleLight: string;
    femaleAlt: string;
    male: string;
  };
  status: {
    red: string;
    amber: string;
    green: string;
    complete: string;
  };
}

export interface ThemeTypography {
  fontFamily: string;
  fontFeatureSettings: string;
  weights: {
    regular: number;
    semibold: number;
    bold: number;
  };
  sizes: {
    small: string;
    label: string;
    base: string;
    large: string;
  };
}

export interface ThemeSpacing {
  chartGap: number;
  legendGap: number;
  labelOffset: number;
  focusRingWidth: string;
  strokeWidths: {
    hairline: string;
    thin: string;
    subtle: string;
    base: string;
    emphasis: string;
    series: string;
  };
  radius: {
    pill: string;
    card: string;
    focus: string;
  };
  margins: {
    scale: {
      top: readonly number[];
      right: readonly number[];
      bottom: readonly number[];
      left: readonly number[];
    };
    byChart: Record<string, ChartMarginPreset>;
  };
}

export interface ChartTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  breakpoints: Breakpoints;
}

export interface ResponsiveTickCount {
  sm?: NumericLike;
  md?: NumericLike;
  lg?: NumericLike;
}

export type DataRow = Record<string, unknown>;
export type D3ParsedRowArray<TRow extends DataRow = DataRow> = Array<TRow> & {
  columns?: readonly string[];
};
export type ChartRowsInput<TRow extends DataRow = DataRow> =
  | readonly TRow[]
  | D3ParsedRowArray<TRow>;
export type ChartDataInput<TRow extends DataRow = DataRow> =
  | ChartRowsInput<TRow>
  | string;
export type RemoteDataFormat = "auto" | "rows" | "csv" | "json";
export type NormalizedInputKind =
  | "empty"
  | "rows"
  | "d3-columns"
  | "csv"
  | "json"
  | "remote-csv"
  | "remote-json";
export type ChartRenderReason = "initial" | "update" | "resize" | "control";
export type BreakpointOverrides = Partial<Record<BreakpointKey, Record<string, unknown>>>;
export type ControlActionType = "filter" | "series-toggle" | "config-swap";
export type ControlPosition = "top" | "bottom";
export type ControlType = "dropdown" | "button-group" | "toggle";
export type ControlOptionValue = ConfigValue;
export type ControlSelectionValue =
  | ControlOptionValue
  | readonly ControlOptionValue[]
  | undefined;

export interface ChartScale {
  (value: unknown): number | undefined;
  bandwidth?: () => number;
}

export interface ChartScaleState {
  x?: ChartScale;
  y?: ChartScale;
  y2?: ChartScale;
}

export interface ChartHighlightEvent {
  key?: string;
  sourceId: string;
}

export interface ChartEventMap {
  highlight: ChartHighlightEvent | undefined;
}

export interface ChartEventBus {
  emit: <TEvent extends keyof ChartEventMap>(
    type: TEvent,
    payload: ChartEventMap[TEvent],
  ) => void;
  on: <TEvent extends keyof ChartEventMap>(
    type: TEvent,
    listener: (payload: ChartEventMap[TEvent]) => void,
  ) => () => void;
}

export interface SeriesStyle {
  className?: string;
  color?: string;
  dashArray?: string | readonly number[];
  fill?: string;
  marker?: "none" | "circle" | "square" | "diamond" | "triangle";
  markerSize?: number;
  opacity?: number;
  stroke?: string;
  strokeDasharray?: string | readonly number[];
  strokeWidth?: number;
}

export interface SeriesSegmentConfig {
  from?: Primitive;
  fromIndex?: number;
  id?: string;
  label?: string;
  style?: SeriesStyle;
  to?: Primitive;
  toIndex?: number;
}

export interface SeriesConfig {
  axis?: "x" | "y" | "y2" | "r";
  id: string;
  key?: string;
  label?: string;
  segments?: readonly SeriesSegmentConfig[];
  stack?: string;
  style?: SeriesStyle;
  type?: string;
  valueKey?: string;
  xKey?: string;
  yKey?: string;
}

export interface LayoutTransitionConfig {
  duration?: number;
  enabled?: boolean;
}

export interface LayoutConfig {
  aspectRatio?: ResponsiveValue<number | readonly [number, number]>;
  chartGap?: NumericLike;
  height?: ResponsiveValue<number>;
  margin?: ResponsiveValue<ChartMargin>;
  smallMultiple?: SmallMultipleConfig;
  transition?: LayoutTransitionConfig;
  width?: ResponsiveValue<number>;
}

export interface AnnotationStyle extends SeriesStyle {
  fontSize?: string;
  textAnchor?: "start" | "middle" | "end";
}

export interface AnnotationConfig {
  axis?: "x" | "y" | "y2";
  className?: string;
  from?: Primitive;
  id?: string;
  label?: string;
  style?: AnnotationStyle;
  to?: Primitive;
  type: "band" | "label" | "line";
  value?: Primitive;
  x?: Primitive;
  x2?: Primitive;
  xAxis?: "x";
  y?: Primitive;
  y2?: Primitive;
  yAxis?: "y" | "y2";
}

export interface PluginConfig<TOptions extends Record<string, unknown> = Record<string, unknown>> {
  enabled?: boolean;
  id?: string;
  name?: string;
  options?: TOptions;
  plugin?: ChartPlugin<any, TOptions>;
  type?: string;
}

export interface ControlOption {
  description?: string;
  label: string;
  value: ControlOptionValue;
}

export interface ControlConfig {
  action: ControlActionType;
  defaultValue?: ControlOptionValue;
  field?: string;
  id: string;
  label?: string;
  multiple?: boolean;
  options?: readonly ControlOption[];
  position?: ControlPosition;
  type: ControlType;
}

export interface AccessibilityTableConfig {
  caption?: string;
  hideAt?: readonly BreakpointKey[];
}

export interface AccessibilityConfig {
  ariaDescription?: string;
  ariaLabel?: string;
  role?: string;
  table?: AccessibilityTableConfig;
  touchTargetMinSize?: number;
}

export interface AxisConfig {
  chartType?: string;
  axisLabel?: string;
  domain?: NumericLike | readonly NumericLike[];
  shared?: boolean;
  showFirst?: boolean;
  showLast?: boolean;
  tickFormat?: string;
  ticks?: ResponsiveTickCount;
  visible?: boolean;
}

export interface AxesConfig {
  x?: AxisConfig;
  y?: AxisConfig;
  y2?: AxisConfig;
}

export interface SmallMultipleConfig {
  chartEvery?: ResponsiveTickCount;
  chartGap?: NumericLike;
  dropAxis?: boolean;
  freeAxis?: boolean;
  useSmallMultiple?: boolean;
}

export interface LegendConfig {
  ciLegend?: boolean;
  height?: ResponsiveTickCount;
  includeNoChange?: boolean;
  legendItemWidth?: NumericLike;
  legendLabels?: string | readonly string[];
  legendLineLength?: NumericLike;
  position?: "top" | "right" | "bottom" | "left" | "inline";
  scaleRadius?: NumericLike;
  shape?: string | readonly string[];
  showLegend?: boolean;
}

export interface DataLabelsConfig {
  numberFormat?: string;
  show?: boolean;
  showDataLabels?: boolean;
}

export interface ChartTypeOptions {
  barChart?: {
    referenceLine?: {
      categoryName?: string;
      showReferenceLine?: boolean;
    };
  };
  columnChart?: {
    axes?: {
      x?: {
        showFirst?: boolean;
        showLast?: boolean;
      };
    };
  };
  groupedBarChart?: {
    groupOnCategory?: string;
  };
  groupedColumnChart?: {
    groupOnCategory?: string;
  };
  lineChart?: {
    interpolateGaps?: boolean;
    lineCurveType?: string;
    referenceCategory?: string;
    zeroLine?: NumericLike;
  };
  rangeCometDot?: {
    avoidOverlapping?: boolean;
    endMarker?: "none" | "circle" | "arrowhead";
    showConfidenceIntervals?: boolean;
    showDataLabels?: boolean;
    startMarker?: "none" | "circle" | "arrowhead";
  };
  scatterBubbleChart?: {
    scaleRadius?: NumericLike;
  };
  stackedBarChart?: {
    stackOffset?: string;
    stackOrder?: string;
    tooltip?: {
      numberFormat?: string;
      showTooltip?: boolean;
    };
  };
  stackedColumnChart?: {
    stackOffset?: string;
    stackOrder?: string;
  };
}

export interface DataConfig {
  dataUrl?: string;
  dateFormat?: string;
  format?: RemoteDataFormat;
  isDateTime?: boolean;
  rowIdKey?: string;
  source?: ChartDataInput;
  transform?: DataTransform;
}

export interface GridFacetConfig {
  columns?: ResponsiveValue<number>;
  field: string;
  focusValues?: readonly Primitive[];
  roleField?: string;
}

export interface BaseChartConfig {
  accessibility?: AccessibilityConfig;
  accessibleSummary?: string;
  annotations?: readonly AnnotationConfig[];
  aspectRatio?: ResponsiveValue<number | readonly [number, number]>;
  axes?: AxesConfig;
  breakPoints?: NumericLike | readonly NumericLike[];
  breakpoints?: BreakpointOverrides;
  chartType?: ChartTypeOptions;
  colourPalette?: string | readonly string[];
  controls?: readonly ControlConfig[];
  data?: DataConfig;
  dataLabels?: DataLabelsConfig;
  drawLegend?: boolean;
  elements?: Record<string, NumericLike | boolean>;
  essential?: Record<string, unknown>;
  graphicDataURL?: string;
  layout?: LayoutConfig;
  legend?: LegendConfig | readonly string[];
  linked?: boolean;
  margin?: ResponsiveValue<ChartMargin>;
  optional?: Record<string, unknown>;
  overrides?: ConfigOverrides | PostRenderOverride;
  plugins?: readonly ChartPluginEntry[];
  responsive?: {
    mediumBreakpoint?: number;
    mobileBreakpoint?: number;
  };
  series?: readonly SeriesConfig[];
  smallMultiple?: SmallMultipleConfig;
  sourceText?: string;
  theme?: DeepPartial<ChartTheme>;
  type?: string;
  xAxisLabel?: string;
  xAxisNumberFormat?: string;
  xAxisTickFormat?: string | ResponsiveTickCount;
  xAxisTicks?: ResponsiveTickCount;
  xDomain?: NumericLike | readonly NumericLike[];
  yAxisLabel?: string;
  yAxisNumberFormat?: string;
  yAxisTicks?: ResponsiveTickCount;
  yDomainMax?: NumericLike;
  yDomainMin?: NumericLike;
}

export interface ResolvedAccessibilityConfig {
  ariaDescription?: string;
  ariaLabel: string;
  role: string;
  table: {
    caption: string;
    hideAt: readonly BreakpointKey[];
  };
  touchTargetMinSize: number;
}

export interface ConfigOverrides {
  breakpoints?: BreakpointOverrides;
  postRender?: PostRenderOverride;
  states?: Record<string, unknown>;
}

export type ResolvedChartConfig<TConfig extends BaseChartConfig = BaseChartConfig> =
  Omit<
    TConfig,
    "accessibility" | "axes" | "controls" | "data" | "layout" | "overrides" | "plugins" | "series" | "type"
  > & {
    accessibility: ResolvedAccessibilityConfig;
    axes: AxesConfig;
    controls: readonly ControlConfig[];
    data: DataConfig;
    layout: LayoutConfig;
    overrides: ConfigOverrides;
    plugins: readonly ChartPluginEntry[];
    series: readonly SeriesConfig[];
    type: string;
  };

export type ChartConfigInput<TConfig extends BaseChartConfig = BaseChartConfig> =
  DynamicConfigInput<TConfig>;

export type GridConfigInput<TConfig extends BaseChartConfig = BaseChartConfig> =
  ChartConfigInput<TConfig> & {
    facet: DynamicConfigInput<GridFacetConfig>;
  };

export type NormalizedDataRow<TRow extends DataRow = DataRow> = TRow & {
  __rowId: string;
  __rowIndex: number;
};

export interface NormalizedSeries {
  axis: "x" | "y" | "y2" | "r";
  id: string;
  key: string;
  label: string;
  segments: readonly SeriesSegmentConfig[];
  style: SeriesStyle;
  values: readonly unknown[];
}

export interface NormalizedDataset<TRow extends DataRow = DataRow> {
  columns: readonly string[];
  input: {
    dataUrl?: string;
    format: RemoteDataFormat;
    kind: NormalizedInputKind;
  };
  rowCount: number;
  rows: readonly NormalizedDataRow<TRow>[];
  series: readonly NormalizedSeries[];
}

export interface DataTransformContext<TConfig extends BaseChartConfig = BaseChartConfig> {
  columns: readonly string[];
  config: ResolvedChartConfig<TConfig>;
  reason: ChartRenderReason;
  rows: readonly NormalizedDataRow[];
}

export type DataTransform<TConfig extends BaseChartConfig = BaseChartConfig> = (
  rows: readonly NormalizedDataRow[],
  context: DataTransformContext<TConfig>,
) => readonly DataRow[] | readonly NormalizedDataRow[];

export interface ResolvedChartFrame {
  aspectRatio: readonly [number, number];
  containerHeight: number;
  containerWidth: number;
  innerHeight: number;
  innerWidth: number;
  margin: ChartMargin;
}

export type ChartDomLayerName =
  | "background"
  | "grid"
  | "plot"
  | "annotations"
  | "overlay";

export interface ChartDom {
  controlsBottom: HTMLDivElement;
  controlsTop: HTMLDivElement;
  defs: SVGDefsElement;
  frame: SVGGElement;
  figure: HTMLDivElement;
  host: HTMLDivElement;
  htmlOverlay: HTMLDivElement;
  id: string;
  layers: Record<ChartDomLayerName, SVGGElement>;
  svg: SVGSVGElement;
  table: HTMLTableElement;
  tableCaption: HTMLTableCaptionElement;
  tableWrapper: HTMLDivElement;
}

export interface ChartMotionSettings {
  duration: number;
  enabled: boolean;
}

export interface SeriesSegmentSlice {
  endIndex: number;
  id: string;
  rows: readonly NormalizedDataRow[];
  startIndex: number;
  style: SeriesStyle;
}

export interface ChartInstance<TConfig extends BaseChartConfig = BaseChartConfig> {
  breakpoint: BreakpointKey;
  config: ResolvedChartConfig<TConfig>;
  container: HTMLElement;
  data: NormalizedDataset;
  destroyed: boolean;
  destroy: () => void;
  id: string;
  render: (reason?: ChartRenderReason) => Promise<ChartInstance<TConfig>>;
  sourceData: NormalizedDataset;
  update: (
    newData?: ChartDataInput,
    newConfig?: DeepPartial<ChartConfigInput<TConfig>>,
  ) => Promise<ChartInstance<TConfig>>;
}

export interface GridChildInstance<TConfig extends BaseChartConfig = BaseChartConfig> {
  chart: ChartInstance<TConfig>;
  context: ConditionalConfigContext;
  facetValue: Primitive;
}

export interface GridInstance<TConfig extends BaseChartConfig = BaseChartConfig> {
  breakpoint: BreakpointKey;
  children: readonly GridChildInstance<TConfig>[];
  container: HTMLElement;
  data: NormalizedDataset;
  destroy: () => void;
  emit: ChartEventBus["emit"];
  on: ChartEventBus["on"];
  update: (
    newData?: ChartDataInput,
    newConfig?: DeepPartial<GridConfigInput<TConfig>>,
  ) => Promise<GridInstance<TConfig>>;
}

export interface ChartRenderContext<TConfig extends BaseChartConfig = BaseChartConfig> {
  addEventListener: <Target extends EventTarget>(
    target: Target,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ) => () => void;
  breakpoint: BreakpointKey;
  config: ResolvedChartConfig<TConfig>;
  configContext: ConditionalConfigContext;
  container: HTMLElement;
  cssVariables: Record<string, string>;
  data: NormalizedDataset;
  dom: ChartDom;
  eventBus: ChartEventBus;
  frame: ResolvedChartFrame;
  getPluginState: <T = unknown>(key: string) => T | undefined;
  motion: ChartMotionSettings;
  reason: ChartRenderReason;
  registerCleanup: (cleanup: () => void) => () => void;
  selection: RootSelection;
  setPluginState: (key: string, state: unknown) => void;
  size: BreakpointKey;
  sourceData: NormalizedDataset;
  theme: ChartTheme;
}

export interface ChartPluginContext<
  TConfig extends BaseChartConfig = BaseChartConfig,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> {
  addEventListener: ChartRenderContext<TConfig>["addEventListener"];
  breakpoint: BreakpointKey;
  config: ResolvedChartConfig<TConfig>;
  configContext: ConditionalConfigContext;
  container: HTMLElement;
  data: NormalizedDataset;
  destroy: ChartInstance<TConfig>["destroy"];
  dom: ChartDom;
  eventBus: ChartEventBus;
  frame: ResolvedChartFrame;
  getPluginState: <T = unknown>(key: string) => T | undefined;
  getState: <T = unknown>() => T | undefined;
  options: TOptions;
  reason: ChartRenderReason;
  registerCleanup: ChartRenderContext<TConfig>["registerCleanup"];
  selection: RootSelection;
  setState: (state: unknown) => void;
  sourceData: NormalizedDataset;
  update: ChartInstance<TConfig>["update"];
}

export interface ChartPlugin<
  TConfig extends BaseChartConfig = BaseChartConfig,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
> {
  name: string;
  onDestroy?: (chart: ChartPluginContext<TConfig, TOptions>) => void;
  onInit?: (chart: ChartPluginContext<TConfig, TOptions>) => void;
  onRender?: (chart: ChartPluginContext<TConfig, TOptions>) => void;
  onUpdate?: (chart: ChartPluginContext<TConfig, TOptions>) => void;
}

export type ChartPluginEntry =
  | string
  | PluginConfig
  | ChartPlugin<any>;

export type PostRenderOverride<
  TConfig extends BaseChartConfig = BaseChartConfig,
> = (selection: RootSelection, context: ChartRenderContext<TConfig>) => void;

export type ChartRenderResult = void | (() => void) | { destroy?: () => void };

export interface ChartDefinition<TConfig extends BaseChartConfig = BaseChartConfig> {
  defaults?: DeepPartial<TConfig>;
  displayName: string;
  id: string;
  render: (context: ChartRenderContext<TConfig>) => ChartRenderResult;
  schema?: unknown;
}

export interface CreateChartOptions<TConfig extends BaseChartConfig = BaseChartConfig> {
  config: ChartConfigInput<TConfig>;
  configContext?: Partial<ConditionalConfigContext> | (() => Partial<ConditionalConfigContext>);
  container: HTMLElement;
  data?: ChartDataInput;
  eventBus?: ChartEventBus;
  fetcher?: typeof fetch;
  theme?: DeepPartial<ChartTheme>;
}

export interface CreateGridOptions<TConfig extends BaseChartConfig = BaseChartConfig> {
  config: GridConfigInput<TConfig>;
  container: HTMLElement;
  data?: ChartDataInput;
  fetcher?: typeof fetch;
  theme?: DeepPartial<ChartTheme>;
}

export type AxisOrientation = "top" | "right" | "bottom" | "left";

export type SharedPrimitiveId =
  | "scales"
  | "axes"
  | "responsive-resize"
  | "colour-application"
  | "legends"
  | "annotations";

export interface SharedPrimitiveSummary {
  description: string;
  evidence: readonly string[];
  id: SharedPrimitiveId;
  name: string;
}

export interface ResponsiveVariantEntry {
  baseId: string;
  breakpoint: BreakpointKey;
  variantId: string;
}

export interface ChartInventoryEntry {
  bespokeGeometry: boolean;
  family: string;
  id: string;
  name: string;
  notes?: string;
  path: string;
  usesAnnotations: boolean;
  usesEnhancedSelect: boolean;
  usesSharedHelpers: boolean;
}
