# Beeswarm

### 1. Files Required

- `config.js`: Contains all chart configuration options.
- `script.js`: Loads the config and renders the chart using D3.

### 2. How to Use

1. Place your data file (e.g., `dataethnicity.csv`) in the beeswarm folder.
2. Edit `config.js` to set your desired options.
3. Open `index.html` in a browser to view the chart.

---

## Configuration Options (`config.js`)

| Option                | Description                                                                 | Default Value / Example                | Accepted Values / Notes                |
|-----------------------|-----------------------------------------------------------------------------|----------------------------------------|----------------------------------------|
| `graphicDataURL`      | Path to the CSV data file.                                                  | `"dataethnicity.csv"`                  | Any CSV filename                       |
| `colourPalette`       | Colour scheme for circles.                                                  | `ONScolours.oceanBlue`                 | Any palette defined in ONScolours      |
| `sourceText`          | Source text shown below the chart.                                          | `"Office for National Statistics"`     | Any string                             |
| `accessibleSummary`   | Text for screen readers.                                                    | Chart summary text                     | Any string                             |
| `xAxisFormat`         | D3 format for x-axis ticks.                                                 | `".0f"`                                | D3 format string                       |
| `layoutMethod`        | Method for positioning circles.                                             | `"binned"`                             | `"binned"` or `"force"`                |
| `forceOptions`        | Options for force layout (if used).                                         | See below                              | Object with keys below                 |
| `xAxisLabel`          | Label for the x-axis.                                                       | `"Percentage"`                         | Any string                             |
| `radius`              | Circle radius.                                                              | `"auto"`                               | `"auto"` or number                     |
| `xDomain`             | Range for x-axis.                                                           | `[0,80]`                               | `"auto"` or array `[min, max]`         |
| `circleDist`          | Vertical distance between circles.                                          | `"auto"`                               | `"auto"` or number                     |
| `numBands`            | Number of bins for binned layout.                                           | `75`                                   | Integer                                |
| `legend`              | Legend display and label.                                                   | `{ show: false, label: "Country average" }` | Object                                 |
| `multiHighlight`      | Allow highlighting multiple groups.                                         | `true`                                 | Boolean                                |
| `averages`            | Show average lines and labels.                                              | See below                              | Object with keys below                 |
| `margin`              | Chart margins for different sizes.                                          | See below                              | Object with `sm`, `md`, `lg`           |
| `seriesHeight`        | Chart height for different sizes.                                           | `{ sm: 100, md: 100, lg: 160 }`        | Object                                 |
| `xAxisTicks`          | Number of x-axis ticks for different sizes.                                 | `{ sm: 3, md: 8, lg: 10 }`             | Object                                 |

---

### Details for Complex Options

#### `forceOptions` (used if `layoutMethod` is `"force"`)
- `strength`: Collision force strength (0-1). Default: `0.5`
- `iterations`: Number of simulation iterations. Default: `120`
- `velocityDecay`: How quickly nodes slow down (0-1). Default: `0.2`
- `alphaMin`: When to stop the simulation. Default: `0.001`
- `centerStrength`: Strength of centering force (0-1). Default: `0.1`

#### `averages`
- `show`: Show average lines. Default: `false`
- `showLabels`: Show labels for averages. Default: `false`
- `colour`: Colour of average lines. Default: `ONScolours.grey100`
- `strokeWidth`: Line width. Default: `3`
- `strokeDash`: Dash pattern. Default: `""`
- `labelColour`: Colour of labels. Default: `ONScolours.grey100`
- `labelFormat`: Format for label numbers. Default: `".1f"`
- `labelPrefix`: Prefix for label text. Default: `"Mean: "`
- `labelOffset`: Position offset for labels. Default: `{ x: 5, y: 0 }`
- `values`: Array of averages per group. Example: `{ group: "Wales", value: 14.3 }`

#### `margin`
- `sm`, `md`, `lg`: Objects with `top`, `right`, `bottom`, `left` values for chart margins.

---
