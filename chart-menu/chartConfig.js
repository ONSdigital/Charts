const chartConfig = [
  {
    name: "Area stacked small multiple",
    url: "https://onsdigital.github.io/Charts/area-stacked-sm/",
    tags: {
      comparison: true,
      "change-over-time": true,
      "part-to-whole": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Bar chart small multiple",
    url: "https://onsdigital.github.io/Charts/bar-chart-horizontal-sm/",
    tags: {
      comparison: true,
      rank: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Bar chart horizontal stacked small multiple",
    url: "https://onsdigital.github.io/Charts/bar-chart-horizontal-stacked-sm/",
    tags: {
      comparison: true,
      "part-to-whole": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Bar chart horizontal stacked group",
    url: "https://onsdigital.github.io/Charts/bar-chart-horizontal-stacked-grouped/",
    tags: {
      comparison: true,
      "part-to-whole": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Bar chart horizontal grouped",
    url: "https://onsdigital.github.io/Charts/bar-chart-horizontal-grouped/",
    tags: {
      comparison: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Beeswarm",
    url: "https://onsdigital.github.io/Charts/beeswarm/",
    tags: {
      distribution: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Column chart",
    url: "https://onsdigital.github.io/Charts/column-chart/",
    tags: {
      comparison: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Column chart stacked with optional line",
    url: "https://onsdigital.github.io/Charts/column-chart-stacked-optional-line/",
    tags: {
      comparison: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Column chart stacked with optional line small multiple",
    url: "https://onsdigital.github.io/Charts/column-chart-stacked-optional-line-sm/",
    tags: {
      comparison: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Column chart with confidence bands",
    url: "https://onsdigital.github.io/Charts/column-chart-ci-bands/",
    tags: {
      comparison: true,
      uncertainty: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Heatmap",
    url: "https://onsdigital.github.io/Charts/heatmap/",
    tags: {
      comparison: true,
      correlation: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Line chart",
    url: "https://onsdigital.github.io/Charts/line-chart/",
    tags: {
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Line chart small multiple focus",
    url: "https://onsdigital.github.io/Charts/line-chart-sm-focus/",
    tags: {
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Line chart small multiple multiseries",
    url: "https://onsdigital.github.io/Charts/line-chart-sm-multiseries/",
    tags: {
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Line chart with area shaded",
    url: "https://onsdigital.github.io/Charts/line-chart-with-ci-area/",
    tags: {
      "change-over-time": true,
      uncertainty: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Population pyramid",
    url: "https://onsdigital.github.io/Charts/population-pyramid/",
    tags: {
      comparison: true,
      distribution: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "Population simple data", path: "population-simple.csv" },
      { name: "Population complex data", path: "population-complex.csv" },
      { name: "Population comparison data", path: "population-comparison.csv" },
      { name: "Population comparison complex data", path: "population-comparison-complex.csv" },
      { name: "Population comparison time data", path: "population-comparison-time.csv" }
    ]
  },
  {
    name: "Range/arrow/dot/bar and reference chart",
    url: "https://onsdigital.github.io/Charts/range-arrow-dot-bar-reference/",
    tags: {
      comparison: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Range/arrow/dot/bar and reference chart small multiple",
    url: "https://onsdigital.github.io/Charts/range-arrow-dot-bar-reference-sm/",
    tags: {
      comparison: true,
      "change-over-time": true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Confidence interval range plot",
    url: "https://onsdigital.github.io/Charts/range-ci-area-grouped/",
    tags: {
      comparison: true,
      uncertainty: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Scatter plot",
    url: "https://onsdigital.github.io/Charts/scatter-plot/",
    tags: {
      correlation: true
    },
    dataFiles: [
      { name: "data.csv", path: "data.csv" }
    ]
  },
  {
    name: "Simple map",
    url: "https://onsdigital.github.io/maptemplates/simplemap/",
    tags: {
      geospatial: true
    },
    dataFiles: [
      { name: "Map data", path: "data/data.csv" }
    ]
  }
];

export default chartConfig;