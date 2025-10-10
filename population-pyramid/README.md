# Population Pyramid - Configuration Documentation

## Overview

The unified population pyramid visualization supports multiple interaction types and data structures through a comprehensive configuration system. This documentation covers all configuration options and provides examples for different use cases.

## Table of Contents

1. [Configuration Structure](#configuration-structure)
2. [Essential Configuration Options](#essential-configuration-options)
3. [Optional Configuration Options](#optional-configuration-options)
4. [Data Structure Requirements](#data-structure-requirements)
5. [Scenario Examples](#scenario-examples)
6. [HTML Requirements](#html-requirements)
7. [Dependencies](#dependencies)


## Configuration Options

### Data Settings

| Property               | Type   | Options                     | Description                                                                                       |
| ---------------------- | ------ | --------------------------- | ------------------------------------------------------------------------------------------------- |
| `graphic_data_url`     | string | -                           | Path to main population data CSV file                                                             |
| `comparison_data`      | string | -                           | Path to comparison data CSV file (optional)                                                       |
| `comparison_time_data` | string | -                           | Path to second comparison dataset for toggle mode (optional)                                      |
| `dataType`             | string | `"counts"`, `"percentages"` | Whether data contains raw counts (to be converted to percentages) or already contains percentages |
| `dataStructure`        | string | `"simple"`, `"complex"`     | Data format structure (see Data Structure Requirements)                                           |

### Interaction Settings

| Property                   | Type    | Options                              | Description                                                              |
| -------------------------- | ------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `interactionType`          | string  | `"static"`, `"toggle"`, `"dropdown"` | Type of user interaction available                                       |
| `hasComparison`            | boolean | `true`, `false`                      | Whether to display comparison lines                                      |
| `hasInteractiveComparison` | boolean | `true`, `false`                      | Whether comparison lines change with user selection (dropdown mode only) |
| `buttonLabels`             | array   | -                                    | Labels for toggle buttons (required for toggle mode)                     |

### Display Settings

| Property            | Type   | Description                                                       |
| ------------------- | ------ | ----------------------------------------------------------------- | 
| `displayType`       | string | `"percentages"`, `"counts"`. Whether to display data as percentages or raw numbers (only applies when `dataType: "counts"`) |
| `xAxisLabel`        | string | Label for x-axis (percentage axis)                                |
| `yAxisLabel`        | string | Label for y-axis (age axis)                                       |
| `xAxisNumberFormat` | string | D3 number format string for x-axis ticks (e.g., `".1%"`, `".0%"`) |
| `yAxisTicksEvery`   | number | Show y-axis tick every N age groups                               |
| `xDomain`   | string or array | Set to `"auto"` to calculate the extent of all data, `"auto-each"` for the extent of the data displayed or manually set with an array for the start and end   |

### Color Settings

| Property                    | Type  | Description                                                          |
| --------------------------- | ----- | -------------------------------------------------------------------- |
| `colour_palette`            | array | `[female_color, male_color]` - Colors for population bars            |
| `comparison_colour_palette` | array | `[female_comparison, male_comparison]` - Colors for comparison lines |

### Text Settings

| Property            | Type   | Description                     |
| ------------------- | ------ | ------------------------------- |
| `legend`            | array  | Legend text labels              |
| `sourceText`        | string | Source attribution text         |
| `accessibleSummary` | string | Text available to screenreaders |

### Responsive Margins

```javascript
margin: {
    sm: { top: 15, right: 20, bottom: 50, left: 20 },  // Small screens
    md: { top: 20, right: 30, bottom: 60, left: 30 },  // Medium screens
    lg: { top: 20, right: 40, bottom: 70, left: 40 },  // Large screens
    centre: 50  // Gap between male and female sides
}
```

### Series Height (Bar Height)

```javascript
seriesHeight: {
    sm: 20,  // Small screens
    md: 25,  // Medium screens
    lg: 30   // Large screens
}
```

### Axis Ticks

```javascript
xAxisTicks: {
    sm: 4,   // Number of x-axis ticks on small screens
    md: 6,   // Number of x-axis ticks on medium screens
    lg: 8    // Number of x-axis ticks on large screens
}
```

## Data Structure Requirements

### Simple Structure (`dataStructure: "simple"`)

Used for basic population pyramids with age groups in rows:

```csv
age,maleBar,femaleBar
0-4,0.032,0.031
5-9,0.035,0.033
10-14,0.038,0.036
15-19,0.042,0.040
...
```

**Requirements:**

- Must have columns: `age`, `maleBar`, `femaleBar`
- Values can be raw numbers (if `dataType: "counts"`) or percentages (if `dataType: "percentages"`) with numbers between 0–1.

### Complex Structure (`dataStructure: "complex"`)

Used for dropdown visualizations with multiple geographic areas:

```csv
AREACD,AREANM,sex,0-4,5-9,10-14,15-19,20-24,25-29
E06000001,Hartlepool,female,1234,1345,1456,1567,1678,1789
E06000001,Hartlepool,male,1289,1398,1499,1601,1712,1823
E06000002,Middlesbrough,female,1888,1999,2100,2211,2322,2433
E06000002,Middlesbrough,male,1934,2045,2156,2267,2378,2489
...
```

**Requirements:**

- Must have columns: `AREACD` (area code), `AREANM` (area name), `sex`
- Age group columns start from column index 3
- Each area needs both male and female rows
- Values can be raw numbers or percentages based on `dataType` setting

## Scenario Examples

### 1. Static Population Pyramid with Comparison

**Use Case:** Display a single population pyramid with comparison lines showing historical data or another population.

```javascript
const config = {
  graphic_data_url: "data/population-2021.csv",
  comparison_data: "data/population-2011.csv",
  dataType: "counts",
  dataStructure: "simple",
  interactionType: "static",
  hasComparison: true,
  hasInteractiveComparison: false,

  xAxisLabel: "Percentage of population",
  yAxisLabel: "Age",
  xAxisNumberFormat: ".1%",
  yAxisTicksEvery: 2,

  colour_palette: ["#d53e4f", "#3288bd"],
  comparison_colour_palette: ["#f46d43", "#74add1"],

  legend: ["2021 Census", "2011 Census"],
  sourceText: "UK Census 2011, 2021",
};
```

### 2. Toggle Between Two Comparison Datasets

**Use Case:** Allow users to switch between two different comparison populations using radio buttons.

```javascript
const config = {
  graphic_data_url: "data/population-current.csv",
  comparison_data: "data/population-2011.csv",
  comparison_time_data: "data/population-2001.csv",
  dataType: "counts",
  dataStructure: "simple",
  interactionType: "toggle",
  hasComparison: true,
  hasInteractiveComparison: false,

  buttonLabels: ["Compare to 2011", "Compare to 2001"],

  xAxisLabel: "Percentage of population",
  yAxisLabel: "Age group",
  xAxisNumberFormat: ".1%",
  yAxisTicksEvery: 1,

  colour_palette: ["#d53e4f", "#3288bd"],
  comparison_colour_palette: ["#f46d43", "#74add1"],

  legend: ["Current population", "Historical comparison"],
  sourceText: "Census data 2001, 2011, 2021",
};
```

### 3. Dropdown with Interactive Comparison

**Use Case:** Dropdown to select different geographic areas, with comparison lines that change based on selection.

```javascript
const config = {
  graphic_data_url: "data/local-authorities.csv",
  comparison_data: "data/national-average.csv",
  dataType: "counts",
  dataStructure: "complex",
  interactionType: "dropdown",
  hasComparison: true,
  hasInteractiveComparison: true,

  xAxisLabel: "Percentage of population",
  yAxisLabel: "Age group",
  xAxisNumberFormat: ".1%",
  yAxisTicksEvery: 1,

  colour_palette: ["#d53e4f", "#3288bd"],
  comparison_colour_palette: ["#f46d43", "#74add1"],

  legend: ["Selected area", "National average"],
  sourceText: "ONS Population Estimates 2021",
};
```

### 4. Dropdown with Static Comparison

**Use Case:** Dropdown to select areas, but comparison lines remain constant (e.g., always showing national average).

```javascript
const config = {
  graphic_data_url: "data/local-authorities.csv",
  comparison_data: "data/uk-national.csv",
  dataType: "counts",
  dataStructure: "complex",
  interactionType: "dropdown",
  hasComparison: true,
  hasInteractiveComparison: false,

  xAxisLabel: "Percentage of population",
  yAxisLabel: "Age group",
  xAxisNumberFormat: ".1%",
  yAxisTicksEvery: 1,

  colour_palette: ["#d53e4f", "#3288bd"],
  comparison_colour_palette: ["#f46d43", "#74add1"],

  legend: ["Selected area", "UK average"],
  sourceText: "ONS Population Estimates 2021",
};
```

### 5. Basic Static Pyramid (No Comparison)

**Use Case:** Simple population pyramid without any comparison lines.

```javascript
const config = {
    graphic_data_url: "data/population-simple.csv",
    dataType: "percentages",
    dataStructure: "simple",
    interactionType: "static",
    hasComparison: false,

    xAxisLabel: "Percentage of population",
    yAxisLabel: "Age",
    xAxisNumberFormat: ".1%",
    yAxisTicksEvery: 2,

    colour_palette: ["#d53e4f", "#3288bd"],

    legend: ["Population by age and sex"],
    sourceText: "Census 2021",
};
```

### 6. Display Raw Numbers Instead of Percentages

**Use Case:** Show actual population counts rather than percentages when working with raw number data.

```javascript
const config = {
    graphic_data_url: "data/population-counts.csv",
    comparison_data: "data/comparison-counts.csv",
    dataType: "counts",
    displayType: "counts",
    dataStructure: "simple",
    interactionType: "static",
    hasComparison: true,
    hasInteractiveComparison: false,

    xAxisLabel: "Population count", // Update label for counts
    yAxisLabel: "Age",
    xAxisNumberFormat: ",.0f", // Format for whole numbers with commas
    yAxisTicksEvery: 2,

    colour_palette: ["#d53e4f", "#3288bd"],
    comparison_colour_palette: ["#f46d43", "#74add1"],

    legend: ["Current population", "Historical population"],
    sourceText: "Census data 2021",
};
```

## HTML Requirements

### Required HTML Elements

```html
<!-- accessible summary -->
<h5 id="accessibleSummary" class="visuallyhidden"></h5>

<!-- Navigation for toggle version -->
<div id="nav"></div>

<!-- Dropdown for dropdown versions -->
<div id="select"></div>

<!-- Legend titles -->
<div id="titles"></div>

<!-- Main chart container -->
<div id="graphic"></div>

<!-- Legend -->
<div id="legend"></div>

<!-- Source -->
<div id="source"></div>
```

### Element Usage by Interaction Type

| Element    | Static                | Toggle       | Dropdown              |
| ---------- | --------------------- | ------------ | --------------------- |
| `#nav`     | Not used              | **Required** | Not used              |
| `#select`  | Not used              | Not used     | **Required**          |
| `#titles`  | Used if hasComparison | **Required** | Used if hasComparison |
| `#graphic` | **Required**          | **Required** | **Required**          |
| `#legend`  | **Required**          | **Required** | **Required**          |
| `#source`  | **Required**          | **Required** | **Required**          |

## Dependencies

### Required Libraries

1. **D3.js v6+** - Core visualization library
2. **Pym.js** - Responsive iframe resizing

### Additional Dependencies for Dropdown Mode

3. **accessible-autocomplete** - Required for Chosen dropdown

### CDN Links

```html
<!-- Core dependencies -->
<script
  src="https://cdn.ons.gov.uk/vendor/d3/6.3.0/d3.min.js"
  type="text/javascript"
></script>
<script
  src="https://cdn.ons.gov.uk/vendor/pym/1.3.2/pym.js"
  type="text/javascript"
></script>

<!-- Dropdown dependencies -->
<script
  type="text/javascript"
  src="https://cdn.ons.gov.uk/vendor/accessible-autocomplete/3.0.1/accessible-autocomplete.min.js"
></script>
<link
  rel="stylesheet"
  href="https://cdn.ons.gov.uk/vendor/accessible-autocomplete/3.0.1/accessible-autocomplete.min.css"
/>
```

## Best Practices

### Performance

- Use `dataType: "percentages"` if your data is already in percentage format to avoid unnecessary calculations
- Consider data size when using complex structures with many geographic areas

### Accessibility

- Ensure color contrast meets WCAG guidelines
- Test keyboard navigation for dropdown and toggle interactions
- Provide meaningful alt text and ARIA labels

### Responsive Design

- Test across different screen sizes
- Adjust `seriesHeight` and `xAxisTicks` for optimal mobile experience
- Consider chart width constraints for readability

### Data Quality

- Ensure age groups are consistently formatted across all datasets
- Verify that comparison data covers the same age ranges as main data
- Test with edge cases (very small populations, missing age groups)

## Troubleshooting

### Common Issues

1. **Charts not appearing**: Check that all required HTML elements exist
2. **Dropdown not working**: Verify jQuery and Chosen are loaded before the main script
3. **Data not loading**: Check CSV file paths and data structure matches configuration
4. **Comparison lines missing**: Ensure comparison data file exists and `hasComparison: true`
5. **Toggle buttons not responding**: Verify `buttonLabels` array matches number of datasets
