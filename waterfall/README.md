# Waterfall Chart Configuration Guide

This README explains the configuration options available in `config.js` for the Waterfall chart template. Each option controls a specific aspect of the chart's appearance, data, or behavior.

## Configuration Options

### Data & Source
- **graphicDataURL**: Path to the CSV data file (default: `data.csv`).
- **sourceText**: Text to display as the data source.
- **accessibleSummary**: Description for screen readers.

### Colours
- **colourPalette**: Array of colours for chart bars (uses ONScolours).
- **netChangeColours**: Colours for the net change bar.

### Sorting & Axes
- **yAxisSort**: Order of y-axis categories. Values: `ascending`, `descending`, `auto`, `none`.
- **showXAxis**: Show/hide x-axis. Boolean.
- **xAxisNumberFormat**: D3 format for x-axis numbers (e.g., `,.0f`).
- **xAxisLabel**: Label for the x-axis.
- **xDomain**: Domain for x-axis. Values: `auto`, `auto-all`, or custom array.
- **xDomainPadding**: Padding for x-axis domain. Number or percentage (e.g., `15%`).

### Flags & Legends
- **flagLabels**: Labels for start/end flags, by size (`sm`, `md`, `lg`). Each has `prefix`, `suffix`, and `format`.
- **legendLabels**: Labels for legend lines (e.g., `{min: "2023", max: "2024"}`).
- **legendItems**: Items to show in the legend, in order. E.g., `["Dec","Inc","No"]`.
- **legendText**: Text for each legend item. E.g., `["Decrease", "Increase", "Less than 0.01% change"]`.

### Data Labels
- **dataLabels**: Controls data label display. Properties:
  - `show`: Show/hide labels (Boolean)
  - `prefix`, `suffix`: Text before/after value
  - `format`: D3 format string

### Net Change Bar
- **netChange**: Controls net change bar. Properties:
  - `show`: Show/hide bar (Boolean)
  - `title`: Title for the bar
  - `prefix`, `suffix`, `format`: Formatting options

### Thresholds & Custom Labels
- **noChangeThreshold**: Value or percentage for "little change" categorization (e.g., `0.01%`).
- **noChangeCustomLabel**: Custom label for "no change" bars.

### Layout & Sizing
- **margin**: Margins for chart by size (`sm`, `md`, `lg`).
- **seriesHeight**: Height of each series by size.
- **xAxisTicks**: Number of x-axis ticks by size.
- **legendHeight**: Height of legend by size.
- **dotSize**: Size of dots in the chart.
- **legendItemWidth**: Width of legend items by size.

### Other Options
- **showZeroLine**: Show/hide zero reference line (Boolean).

## Example
```js
config = {
  graphicDataURL: "data.csv",
  colourPalette: [ONScolours.oceanBlue, ONScolours.coralPink, ONScolours.grey50],
  // ...other options...
}
```

## Notes
- Size options (`sm`, `md`, `lg`) refer to small, medium, and large chart layouts.
- D3 format strings (e.g., `,.0f`) control number formatting. See [D3-format documentation](https://github.com/d3/d3-format) for details.
- Custom domains for axes can be set as arrays, e.g., `[0, 10000]`.

---
For further customization, edit `config.js` and refer to comments for guidance.
