# Example data sets

These files provide compact, synthetic data that match the column layouts used across the chart templates in this repo. Each file is small but valid for the charts listed below.

## Column headers
Column headers have been standardised
`date` for time-series or `name` for categories
`category` for sub-series within each name/date
`group` for higher level grouping/small-multiples
`value` for the measure

`lowerBound` and `upperBound` for confidence intervals

## File overview

### Categorical data
- [example-data/categorical-clustered.csv](example-data/categorical-clustered.csv)
  - Clustered bar/column charts.
- [example-data/categorical-single.csv](example-data/categorical-single.csv)
  - Bar chart, column chart, simple bar/column variants.
- [example-data/categorical-grouped.csv](example-data/categorical-grouped.csv)
  - Grouped bar/column charts.
- [example-data/categorical-grouped-clustered.csv](example-data/categorical-grouped-clustered.csv)
  - Grouped clustered bar/column charts.
- [example-data/categorical-stacked-wide.csv](example-data/categorical-stacked-wide.csv)
  - Stacked bar/column charts, heatmap.
- [example-data/categorical-stacked-grouped.csv](example-data/categorical-stacked-grouped.csv)
  - Stacked grouped bar/column charts.
- [example-data/categorical-dropdown.csv](example-data/categorical-dropdown.csv)
  - Bar chart with dropdown.

### Time series data

- [example-data/time-series-wide.csv](example-data/time-series-wide.csv)
  - Line charts, area charts, stacked area, column/line charts with multiple series.
- [example-data/time-series-single.csv](example-data/time-series-single.csv)
  - Column chart (single series).
- [example-data/time-series-long.csv](example-data/time-series-long.csv)
  - Line chart small-multiples (multi-series long format).
- [example-data/time-series-ci.csv](example-data/time-series-ci.csv)
  - Line chart with confidence interval area.
- [example-data/column-ci-bands.csv](example-data/column-ci-bands.csv)
  - Column chart with confidence interval bands.


### Confidence interval


### Chart specific formats

- [example-data/doughnut.csv](example-data/doughnut.csv)
  - Doughnut chart.
- [example-data/scatter.csv](example-data/scatter.csv)
  - Scatter/bubble plot (static).
- [example-data/bubble-animated.csv](example-data/bubble-animated.csv)
  - Scatter/bubble plot (animated).
- [example-data/stacked-optional-line.csv](example-data/stacked-optional-line.csv)
  - Stacked column chart with optional line.
- [example-data/range-ci.csv](example-data/range-ci.csv)
  - Range CI area grouped chart.
- [example-data/range-arrow-dot.csv](example-data/range-arrow-dot.csv)
  - Range arrow dot bar reference chart.
- [example-data/waterfall.csv](example-data/waterfall.csv)
  - Waterfall chart.
- [example-data/slope.csv](example-data/slope.csv)
  - Slope chart.
- [example-data/population-pyramid.csv](example-data/population-pyramid.csv)
  - Population pyramid chart.
- [example-data/beeswarm.csv](example-data/beeswarm.csv)
  - Beeswarm chart.
