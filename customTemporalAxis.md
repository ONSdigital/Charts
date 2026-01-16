# customTemporalAxis

`customTemporalAxis` is a flexible D3 axis generator for temporal data, supporting both `scaleTime` and `scaleBand`. It enables hierarchical time units, fiscal/custom year starts, primary/secondary label levels, and automatic label suppression.

## Importing

```js
import { customTemporalAxis, prefixYearFormatter, quarterYearFormatter } from "./lib/helpers.js";
```

## Basic Usage

### Time Scale (`d3.scaleTime` or `d3.scaleUtc`)

```js
const x = d3.scaleUtc()
  .domain([new Date("2021-01-01"), new Date("2022-01-01")])
  .range([0, width]);

const xAxis = customTemporalAxis(x);

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);
```

### Band Scale (`d3.scaleBand`)

```js
const dates = d3.utcDay.range(new Date("2021-04-30"), new Date("2021-05-14"));
const x = d3.scaleBand().domain(dates).range([0, width]).paddingInner(0.1);

const xAxis = customTemporalAxis(x).timeUnit("day");

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);
```

## Accessors

- `.scale(scale)` – set or get the scale
- `.orient("bottom"|"top")` – axis orientation
- `.tickSize(n)` – tick size (time scale only)
- `.tickPadding(n)` – tick label padding
- `.timeUnit("day"|"month"|"quarter"|"year"|null)` – primary time unit
- `.secondaryTimeUnit("parent"|"year"|null|false)` – secondary label unit
- `.tickFormat(fn)` – primary label formatter
- `.secondaryTickFormat(fn)` – secondary label formatter
- `.yearStartMonth(n)` – set start month for fiscal/custom years (0=Jan, 3=Apr, etc.)

## Tick Format Examples

### Prefix Year Formatter

```js
axis.secondaryTickFormat(d => prefixYearFormatter(d, 3, "FY")); // FY2021/22
```

### Quarter-Year Formatter

```js
axis.tickFormat(d => quarterYearFormatter(d, 3)); // Q1 2021, Q2 2021, etc.
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
  .secondaryTickFormat(d => {
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
