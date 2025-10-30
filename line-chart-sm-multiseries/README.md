# Line Chart Small Multiple (Multiseries)

This template displays a small multiple of line charts, where each chart shows a different dataset (series). Each line within a chart is coloured according to its category, allowing for clear comparison of multiple categories across series.

### Data and Accessibility

- **graphicDataURL**: Path to the CSV data file (default: `data.csv`).
- **dateFormat**: Format string for parsing dates (default: `%d/%m/%Y`).
- **accessibleSummary**: Text summary for screen readers.

### Colour and Appearance

- **colourPalette**: Array of colours for category lines (e.g., `ONSlinePalette`).
- **lineCurveType**: D3 curve type for lines. Options include:
  - `curveLinear` (default), `curveStep`, `curveStepBefore`, `curveStepAfter`, `curveBasis`, `curveCardinal`, `curveCatmullRom`, `curveMonotoneX`.

### Chart Layout and Sizing

- **chartEvery**: Number of charts per row for each screen size (`sm`, `md`, `lg`).
- **aspectRatio**: Aspect ratio for each chart by screen size.
- **margin**: Margins for each chart by screen size (top, right, bottom, left).
- **chartGap**: Gap (in pixels) between charts.
- **mobileBreakpoint**: Screen width (px) below which mobile layout is used.
- **mediumBreakpoint**: Screen width (px) below which medium layout is used.

### Axes and Scales

- **xDomain**: X-axis domain. Set to `"auto"` or an array (e.g., `[0, 100]`).
- **xAxisTickFormat**: Date format for x-axis ticks by screen size.
- **xAxisTicksEvery**: Interval for x-axis ticks by screen size (always includes first and last date).
- **yAxisFormat**: Number format for y-axis labels (e.g., `,.0f`).
- **yAxisTicks**: Number of y-axis ticks by screen size.
- **yAxisLabel**: Label for the y-axis.
- **zeroLine**: Value at which to draw a zero/reference line (e.g., `"0"`).
- **dropYAxis**: If `true`, only the first chart in each row shows y-axis labels (unless `freeYAxisScales` is `true`).
- **freeYAxisScales**: If `true`, each chart has its own y-axis scale and always shows the y-axis.

### Legend and Source

- **sourceText**: Text to display as the data source below the chart.
- **elements**: Object controlling which UI elements are shown (e.g., legend, titles).

### Example Data Structure

The CSV data should have columns for `date`, `series`, and one or more category columns. Example:

```
date,series,Category A,Category B,Category C
01/01/2020,Region 1,10,20,30
01/01/2020,Region 2,15,25,35
...
```

---

For more details and advanced usage, see the comments in `config.js`.