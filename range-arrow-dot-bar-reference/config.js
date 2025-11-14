config = {
  graphicDataUrl: "data.csv",
  chartType: "arrow",
  // can be range, dot, arrow or bar (for bar with reference point)
  colourPaletteDots: [ONScolours.oceanBlue, ONScolours.springGreen],
  colourPaletteDotsStroke: [ONScolours.white, ONScolours.white],
  //default stroke is none. Can be added for contrast or emphasis
  colourPaletteArrows: [ONScolours.oceanBlue, ONScolours.coralPink],
  colourPaletteBar: [ONScolours.skyBlue],
  sourceText: "Office for National Statistics",
  accessibleSummary: "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
  numberFormat: ".0f",
  xAxisTickFormat: ".0f",
  xAxisLabel: "x axis label",
  //show guidelines on range or arrow plot (default is false for both)
  // guidelines must always show on dot, and not show on bar
  showGuidelines: {
    range: false,
    arrow: true,
  },
  xDomain: [-25, 104],
  // either auto or a custom domain as an array e.g [0,100]
  showDataLabels: true,
  // can be true, false, or "desktopOnly", quotes only if desktopOnly
  margin: {
    sm: {
      top: 5,
      right: 20,
      bottom: 40,
      left: 130,
    },
    md: {
      top: 5,
      right: 20,
      bottom: 40,
      left: 130,
    },
    lg: {
      top: 5,
      right: 20,
      bottom: 40,
      left: 140,
    },
  },
  seriesHeight: {
    sm: 40,
    md: 40,
    lg: 40,
  },
  xAxisTicks: {
    sm: 3,
    md: 8,
    lg: 10,
  },
  mobileBreakpoint: 510,
  mediumBreakpoint: 600,
};
