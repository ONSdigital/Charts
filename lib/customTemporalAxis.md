# customTemporalAxis

`customTemporalAxis` is a flexible D3 axis generator for temporal data, supporting both `scaleTime` and `scaleBand`.

It enables:

- Hierarchical time units (day → month → quarter → year)
- Fiscal / academic / custom year starts (e.g. April–April, Sept–Sept)
- Primary and secondary label levels
- Major and minor ticks for time scales
- Parent unit boundaries for band scales
- Automatic label suppression based on available space
- Explicit control over primary and secondary units


## Importing

```js
import {
  customTemporalAxis,
  prefixYearFormatter,
  quarterYearFormatter,
} from "./lib/helpers.js";
```

## Basic Usage

### Time Scale (`d3.scaleTime` or `d3.scaleUtc`)

```js
const x = d3
  .scaleUtc()
  .domain([new Date("2021-01-01"), new Date("2022-01-01")])
  .range([0, width]);

const xAxis = customTemporalAxis(x);

svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);
```

### Band Scale (`d3.scaleBand`)

```js
const dates = d3.utcDay.range(new Date("2021-04-30"), new Date("2021-05-14"));
const x = d3.scaleBand().domain(dates).range([0, width]).paddingInner(0.1);

const xAxis = customTemporalAxis(x).timeUnit("day");

svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);
```

## Scale-specific Behaviour

### `scaleTime`

- Renders minor and major ticks
- Minor ticks:
  - 1px stroke
  - 10px length
- Major ticks (start of parent unit):
  - 1.5px stroke
  - 25px length
- Supports primary + secondary labels

### `scaleBand`

- No minor/major ticks
- Renders parent unit boundaries instead
- Supports partial parent units (e.g. mid-month → mid-month)
- Labels are centered on bands or parent ranges

## Primary & Secondary Units

### Primary unit

Controls the main granularity of the axis.

```
axis.timeUnit("month");
```

Valid values:

- "day"
- "month"
- "quarter"
- "year"
- null → automatic selection based on domain span

### Secondary unit

Controls the parent label level.

```
axis.secondaryTimeUnit("parent");
```

| Value    | Meaning                       |
| -------- | ----------------------------- |
| "parent" | Use parent of primary unit    |
| "year"   | Explicit secondary unit       |
| null     | Auto (parent if space allows) |
| auto     | Auto (parent if space allows) |
| false    | Disable secondary labels      |

Examples:

```
axis.secondaryTimeUnit(false); // no secondary labels
axis.secondaryTimeUnit("year"); // force years
axis.secondaryTimeUnit(null); // auto
axis.secondaryTimeUnit('auto'); // auto
```

## All Accessors

### Scale

Set or get the scale

```
axis.scale(scale)
```

also set through

```
let xAxis = customTemporalAxis(scale)
svg.append('g').call(axis)
```

### Orientation

Axis orientation

```
axis.orient("bottom") // default
axis.orient("top")
```

### Tick size (time scale only)

```
axis.tickSize(25)
```

### Tick padding

```
axis.tickPadding(6)
```

### Tick count

```
axis.ticks(12)
```

### Primary time unit

```
axis.timeUnit("quarter")
```

Options are `"day"|"month"|"quarter"|"year"|null`

- Overrides automatic unit selection
- Works for both time and band scales

### Secondary time unit

```
axis.secondaryTimeUnit("parent")
axis.secondaryTimeUnit("year")
axis.secondaryTimeUnit(false)
```

### Primary label formatter

```
axis.tickFormat(d3.utcFormat("%b"));
```

### Secondary label formatter

```
axis.secondaryTickFormat(d => `FY${d.getUTCFullYear()}`);
```

### Year starting month

```
axis.yearStartMonth(3)
```

Set start month for fiscal/custom years (0=Jan, 3=Apr, etc.)

## Tick Format Examples

### Prefix Year Formatter

```js
axis.secondaryTickFormat((d) => prefixYearFormatter(d, 3, "FY")); // FY2021/22
```

### Quarter-Year Formatter

```js
axis.tickFormat((d) => quarterYearFormatter(d, 3)); // Q1 2021, Q2 2021, etc.
```

Or use D3 formatters:

```js
axis.tickFormat(d3.utcFormat("%b")); // Jan, Feb, Mar, ...
```

## Fiscal/Custom Year Start

Set the starting month for years (e.g., April for UK financial years):

```js
axis.yearStartMonth(3); // 0=Jan, 3=Apr, 8=Sept, etc.
```

## Behavior

### Time Scales

- Renders minor (thin, short) and major (thicker, longer) ticks
- Supports primary and secondary labels
- Labels only render if enough space is available

### Band Scales

- Renders parent unit boundaries (not ticks)
- Labels are centered on bands or parent ranges
- Handles partial parent units (e.g., mid-month to mid-month)
- If labels don't fit, only first/last are shown

## Common Patterns

### Financial Year Axis

```js
const axis = customTemporalAxis(x)
  .timeUnit("quarter")
  .secondaryTimeUnit("year")
  .secondaryTickFormat((d) => {
    const y = d.getUTCFullYear();
    return `FY${y}/${(y + 1).toString().slice(-2)}`;
  });
```

### Disable Secondary Labels

```js
axis.secondaryTimeUnit(false);
```

## Design Philosophy

- Time scales show structure (major/minor ticks)
- Band scales show grouping (parent boundaries)
- Labels never lie — if they don’t fit, they don’t render
- Fiscal calendars are first-class, not hacks

---
