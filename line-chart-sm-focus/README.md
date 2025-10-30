# Line Chart Small Multiple (Focus)

This template displays a small multiple of line charts, where each chart shows the same dataset but highlights a different category line. The highlighted line is emphasized, while other lines are visually suppressed, supporting accessible comparison when many lines are present.

### Data Structure
- The data should be in CSV format, with a `date` column and one column per category.
- The `config.graphicDataURL` option specifies the CSV file to load.
- Dates are parsed using the format in `config.dateFormat` (default: `%d/%m/%Y`).
- Missing values are handled and interpolated if `config.interpolateGaps` is true.

### Configuration Options
- **Colour Palette:**
	- `config.colourPalette` defines the colours for the selected group, reference group, and all other groups.
- **Reference Category:**
	- `config.referenceCategory` (e.g., "England") is always shown as a reference line on all charts.
- **Chart Layout:**
	- `config.chartEvery` sets how many charts per row for different screen sizes (`sm`, `md`, `lg`).
	- `config.aspectRatio` and `config.margin` control chart sizing and spacing.
	- `config.chartGap` sets the gap between charts.
- **Axes:**
	- `config.yDomain` can be set to "auto" or a fixed range (e.g., `[0, 100]`).
	- `config.xAxisTickFormat` and `config.xAxisNumberFormat` control x-axis label formatting.
	- `config.xAxisTicksEvery` and `config.yAxisTicks` set tick intervals.
	- `config.yAxisLabel` and `config.xAxisLabel` set axis labels.
	- `config.dropYAxis` drops y-axis labels except for the first chart in each row.
- **Lines and Labels:**
	- `config.lineCurveType` sets the D3 curve type for lines (e.g., `curveLinear`, `curveStep`, etc.).
	- `config.labelFinalPoint` adds a label and circle to the last data point of the highlighted line.
- **Legend and Source:**
	- The legend is automatically generated using `config.legendLabel`, `config.referenceCategory`, and `config.allLabel`.
	- The data source is shown using `config.sourceText`.

### Rendering Logic
- The script loads and parses the data, then creates a container for each category (excluding the reference category).
- For each chart:
	- All lines are drawn, but the focused category is highlighted using the primary colour, the reference category uses a secondary colour, and all others are greyed out.
	- The y-axis grid and labels are only shown on the first chart in each row for clarity.
	- The x-axis is formatted and labels are spaced according to configuration.
	- Optionally, the last point of the highlighted line is labelled and marked with a circle.
- The legend and source are rendered below the charts.

### Accessibility
- The template supports accessible summaries via `config.accessibleSummary`.
- Visual emphasis and colour choices are designed for clarity and accessibility.

### Customisation
- All behaviour can be adjusted via the `config.js` file.
- The template is responsive and adapts to different screen sizes.

### Example Config
See `config.js` for a full list of options and example values.