import {
  initialise,
  wrap,
  addSvg,
  calculateChartWidth,
  addDataLabels,
  addChartTitleLabel,
  addAxisLabel,
  diamondShape,
  adjustColorForContrast
} from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let legend = d3.select("#legend");
let pymChild = null;
let graphic_data, size, svg;

function setupArrowhead(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs
    .append("svg:marker")
    .attr("id", "annotation_arrowhead")
    .attr("class", "arrowheadMarker")
    .attr("refX", 3.27)
    .attr("refY", 3.86)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadMarker
    .append("path")
    .attr("stroke", "context-stroke")
    .attr("fill", "none")
    .attr("d", "M0.881836 1.45544L3.27304 3.84665L0.846591 6.2731");
}

function getLegendLabels(data) {
  let minColumn = graphic_data.columns[1];
  let maxColumn = graphic_data.columns[2];

  return { valueLabel: minColumn, refLabel: maxColumn };
}

/**
 * Draws a comet-plot style legend in the #legend div for arrow charts.
 * Shows Increase (→), Decrease (←) and No change (|) items with column name labels.
 * Used instead of the inline arrowLegend when the arrow change is too small to read clearly.
 */
function drawArrowCometLegend({ legendContainer, minColumn, maxColumn, colourPaletteArrows }) {
  legendContainer.selectAll("*").remove();

  const lineLength = 40;
  const lineY = 26;
  const svgHeight = 36;

  const items = [
    { label: "Increase", color: colourPaletteArrows[0], leftCol: minColumn, rightCol: maxColumn, goRight: true,  boldLeft: false },
    { label: "Decrease", color: colourPaletteArrows[1], leftCol: maxColumn, rightCol: minColumn, goRight: false, boldLeft: true  },
    { label: "No change", color: colourPaletteArrows[2], isNoChange: true },
  ];

  items.forEach(({ label, color, leftCol, rightCol, goRight, boldLeft, isNoChange }) => {
    const item = legendContainer.append("div").attr("class", "legend--item");
    const svgEl = item.append("svg").attr("height", svgHeight).attr("width", 200);

    if (isNoChange) {
      svgEl.append("line")
        .attr("x1", 6).attr("x2", 6)
        .attr("y1", lineY - 7).attr("y2", lineY + 7)
        .attr("stroke", color).attr("stroke-width", "3px");

      svgEl.append("text")
        .attr("x", 14).attr("y", lineY + 4)
        .attr("fill", color).attr("class", "legendLabel")
        .text(label);

      const bbox = svgEl.node().getBBox();
      svgEl.attr("width", bbox.x + bbox.width + 4);
    } else {
      const leftText = svgEl.append("text")
        .attr("x", 2).attr("y", lineY + 4)
        .attr("text-anchor", "start")
        .attr("fill", color).attr("class", "legendLabel")
        .style("font-weight", boldLeft ? "bold" : null)
        .text(leftCol);

      const leftW = leftText.node().getBBox().width;
      const lineX1 = leftW + 8;
      const lineX2 = lineX1 + lineLength;

      // Direction label centred above the arrow line
      svgEl.append("text")
        .attr("x", (lineX1 + lineX2) / 2).attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("fill", color).attr("class", "legendLabel")
        .text(label);

      // For decrease, draw line right-to-left so marker-end arrowhead points left
      svgEl.append("line")
        .attr("x1", goRight ? lineX1 : lineX2)
        .attr("x2", goRight ? lineX2 : lineX1)
        .attr("y1", lineY).attr("y2", lineY)
        .attr("stroke", color).attr("stroke-width", "2px")
        .attr("marker-end", "url(#annotation_arrowhead)");

      const rightText = svgEl.append("text")
        .attr("x", lineX2 + 8).attr("y", lineY + 4)
        .attr("text-anchor", "start")
        .attr("fill", color).attr("class", "legendLabel")
        .style("font-weight", boldLeft ? null : "bold")
        .text(rightCol);

      const rtBBox = rightText.node().getBBox();
      svgEl.attr("width", rtBBox.x + rtBBox.width + 4);
    }
  });
}

function drawGraphic() {
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  // Determine chart type - default to 'range' if not specified
  const chartType = config.chartType || "range";

  let minColumn = graphic_data.columns[1];
  let maxColumn = graphic_data.columns[2];

  // Get dynamic legend labels
  const { valueLabel, refLabel } = getLegendLabels(graphic_data);

  // Determine whether the arrow change is small enough to use the comet-style
  // legend in #legend rather than cramped inline labels above the first row.
  const preChartWidth = calculateChartWidth({
    screenWidth: parseInt(graphic.style("width")),
    chartEvery: config.chartEvery[size],
    chartMargin: config.margin[size],
  });
  const preXDomain =
    config.xDomain === "auto"
      ? [
          Math.min(
            0,
            d3.min(graphic_data, (d) => +d[minColumn]),
            d3.min(graphic_data, (d) => +d[maxColumn])
          ),
          Math.max(
            d3.max(graphic_data, (d) => +d[minColumn]),
            d3.max(graphic_data, (d) => +d[maxColumn])
          ),
        ]
      : config.xDomain;
  const preX = d3.scaleLinear().range([0, preChartWidth]).domain(preXDomain);
  const firstRow = graphic_data[0];
  const arrowPixelWidth =
    chartType === "arrow" && firstRow
      ? Math.abs(preX(+firstRow[maxColumn]) - preX(+firstRow[minColumn]))
      : Infinity;
  const smallChangeThreshold = config.smallChangeLegendThreshold ?? 40;
  const useInlineLegend = chartType !== "arrow" || arrowPixelWidth >= smallChangeThreshold;

  // Set up the legend based on chart type
  if (chartType === "bar") {
    legend
      .append("div")
      .attr("class", "legend--item--here")
      .append("div")
      .attr("class", "legend--icon--circle")
      .style("background-color", config.colourPaletteBar);

    d3.select(".legend--item--here")
      .append("div")
      .append("p")
      .attr("class", "legend--text")
      .html(valueLabel);

    // Updated legend for diamond reference markers
    legend
      .append("div")
      .attr("class", "legend--item--here refmarker")
      .append("svg")
      .attr("height", 18)
      .attr("width", 25)
      .append("path")
      .attr("class", "diamondStyle")
      .attr("d", diamondShape(10))
      .attr("transform", "translate(12, 7)")
      .attr("fill", "white")
      .attr("stroke", ONScolours.black)
      .attr("stroke-width", "1.5px");

    d3.select(".legend--item--here.refmarker")
      .append("div")
      .append("p")
      .attr("class", "legend--text")
      .html(refLabel);
  } else if (chartType === "range" || chartType === "dot") {
    // Legend for range/dot chart
    legend
      .append("div")
      .attr("class", "legend--item--here")
      .append("svg")
      .attr("height", 14)
      .attr("width", 25)
      .append("circle")
      .attr("cx", 12)
      .attr("cy", 7)
      .attr("r", 6)
      .attr("fill", config.colourPaletteDots[0])
      .attr("stroke", config.colourPaletteDotsStroke[0])
      .attr("stroke-width", "1.5px");

    d3.select(".legend--item--here")
      .append("div")
      .append("p")
      .attr("class", "legend--text")
      .html(valueLabel);

    legend
      .append("div")
      .attr("class", "legend--item--here refmarker")
      .append("svg")
      .attr("height", 18)
      .attr("width", 25)
      .append("path")
      .attr("class", "diamondStyle")
      .attr("d", diamondShape(10))
      .attr("transform", "translate(12, 7)")
      .attr("fill", config.colourPaletteDots[1])
      .attr("stroke", config.colourPaletteDotsStroke[1])
      .attr("stroke-width", "1.5px");

    d3.select(".legend--item--here.refmarker")
      .append("div")
      .append("p")
      .attr("class", "legend--text")
      .html(refLabel);
  }
  // Arrow chart uses a comet-style legend in #legend (small change) or inline labels (large change)

  // Nest the graphic_data by the 'series' column
  let nested_data = d3.group(graphic_data, (d) => d.series);

  //Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
  let namesArray = [...nested_data][0][1].map((d) => d.name);

  // Create a container div for each small multiple
  let chartContainers = graphic
    .selectAll(".chart-container")
    .data(Array.from(nested_data))
    .join("div")
    .attr("class", "chart-container");

  function drawChart(container, seriesName, data, chartIndex) {
    //Sort the data so that the bars in each chart are in the same order
    data.sort(
      (a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name)
    );

    // Calculate the height based on the data
    let height =
      config.seriesHeight[size] * data.length + 10 * (data.length - 1) + 12;

    // Extra top margin only needed when using inline arrowLegend labels
    let extraMarginTop = 0;
    if (config.chartType === "arrow" && chartIndex === 0 && useInlineLegend) {
      extraMarginTop = 12;
    }

    let chartsPerRow = config.chartEvery[size];
    let chartPosition = chartIndex % chartsPerRow;

    let margin = { ...config.margin[size] };

    // If the chart is not in the first position in the row, reduce the left margin
    if (config.dropYAxis) {
      if (chartPosition !== 0) {
        margin.left = 10;
      }
    }

    let chart_width = calculateChartWidth({
      screenWidth: parseInt(graphic.style("width")),
      chartEvery: config.chartEvery[size],
      chartMargin: config.margin[size],
    });

    //set up scales
    const x = d3.scaleLinear().range([0, chart_width]);

    const y = d3
      .scaleBand()
      .paddingOuter(0.2)
      .paddingInner(((data.length - 1) * 10) / (data.length * 30))
      .range([0, height])
      .round(true);

    //use the data to find unique entries in the name column
    y.domain([...new Set(data.map((d) => d.name))]);

    //set up yAxis generator
    let yAxis = d3
      .axisLeft(y)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d) =>
        config.dropYAxis !== true ? d : chartPosition == 0 ? d : ""
      );

    //set up xAxis generator
    let xAxis = d3
      .axisBottom(x)
      .tickSize(-height)
      .tickFormat(d3.format(config.dataLabels.numberFormat))
      .ticks(config.xAxisTicks[size]);

    //create svg for chart
    svg = addSvg({
      svgParent: container,
      chartWidth: chart_width,
      height: height + margin.top + margin.bottom + extraMarginTop,
      margin: margin,
    });

    // Adjust transform for extra margin
    if (extraMarginTop > 0) {
      svg.attr(
        "transform",
        `translate(${margin.left}, ${margin.top + extraMarginTop})`
      );
    }

    if (config.xDomain == "auto") {
      x.domain([
        Math.min(
          0,
          d3.min(graphic_data.map((d) => Number(d[minColumn]))),
          d3.min(graphic_data.map((d) => Number(d[maxColumn])))
        ),
        //x domain is the maximum out of the value and the reference value
        Math.max(
          d3.max(graphic_data.map((d) => Number(d[minColumn]))),
          d3.max(graphic_data.map((d) => Number(d[maxColumn])))
        ),
      ]);
    } else {
      x.domain(config.xDomain);
    }

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis)
      .selectAll("line")
      .each(function (d) {
        if (d == 0) {
          d3.select(this).attr("class", "zero-line");
        }
      });

    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .selectAll("text")
      .call(wrap, margin.left - 20);

    if (
      chartType === "dot" ||
      (chartType === "range" && config.showGuidelines?.range) ||
      (chartType === "arrow" && config.showGuidelines?.arrow)
    ) {
      svg
        .selectAll("line.guideline")
        .data(data)
        .join("line")
        .attr("class", "guideline")
        .attr("x1", x(x.domain()[0]))
        .attr("x2", x(x.domain()[1]))
        .attr("y1", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("y2", (d) => y(d.name) + y.bandwidth() / 2);
    }

    // Setup arrowhead marker for arrow charts
    if (chartType === "arrow" && chartIndex === 0) {
      setupArrowhead(svg);
    }

    // Add dynamic legend for arrow chart (only on first chart, only when inline)
    if (chartType === "arrow" && chartIndex === 0 && data.length > 0 && useInlineLegend) {
      const firstDataPoint = data[0];
      const yPos = y(firstDataPoint.name) + y.bandwidth() / 2;

      let refColumn = maxColumn;
      let valueColumn = minColumn;

      // Add label for ref value (start point) - using column name
      svg
        .append("text")
        .attr("class", "arrowLegend")
        .attr("x", x(firstDataPoint[maxColumn]))
        .attr("y", yPos - 20)
        .attr(
          "text-anchor",
          +firstDataPoint[minColumn] < +firstDataPoint[maxColumn]
            ? "start"
            : "end"
        )
        .text(refColumn);

      // Add label for value (end point) - only if values are different
      if (+firstDataPoint[maxColumn] !== +firstDataPoint[minColumn]) {
        svg
          .append("text")
          .attr("class", "arrowLegend")
          .attr("x", x(firstDataPoint[minColumn]))
          .attr("y", yPos - 20)
          .attr(
            "text-anchor",
            +firstDataPoint[minColumn] < +firstDataPoint[maxColumn]
              ? "end"
              : "start"
          )
          .text(valueColumn);
      }

      // Add connecting lines to show which label goes to which end
      svg
        .append("line")
        .attr("class", "legendConnector")
        .attr("x1", x(firstDataPoint[maxColumn]))
        .attr("x2", x(firstDataPoint[maxColumn]))
        .attr("y1", yPos - 15)
        .attr("y2", yPos - 5);

      // Line to value (only if values are different)
      if (+firstDataPoint[maxColumn] !== +firstDataPoint[minColumn]) {
        svg
          .append("line")
          .attr("class", "legendConnector")
          .attr("x1", x(firstDataPoint[minColumn]))
          .attr("x2", x(firstDataPoint[minColumn]))
          .attr("y1", yPos - 15)
          .attr("y2", yPos - 5);
      }
    }

    // Add connecting lines for range chart
    if (chartType === "range") {
      svg
        .selectAll("line.between")
        .data(data)
        .join("line")
        .attr("class", "between")
        .attr("x1", (d) => x(d[maxColumn]))
        .attr("x2", (d) => x(d[minColumn]))
        .attr("y1", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("y2", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("stroke", ONScolours.grey30)
        .attr("stroke-width", "3px");
    }

    // Draw bars for bar chart
    if (chartType === "bar") {
      svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => (d[minColumn] < 0 ? x(d[minColumn]) : x(0)))
        .attr("y", (d) => y(d.name))
        .attr("width", (d) => Math.abs(x(d[minColumn]) - x(0)))
        .attr("height", y.bandwidth())
        .attr("fill", config.colourPaletteBar);
    }

    // Draw arrows for arrow chart
    if (chartType === "arrow") {
      svg
        .selectAll("line.arrowline")
        .data(data)
        .join("line")
        .attr("class", "between")
        .attr("x1", (d) => x(d[maxColumn]))
        .attr("x2", (d) => {
          return +d[maxColumn] === +d[minColumn]
            ? x(d[maxColumn])
            : x(d[minColumn]);
        })
        .attr("y1", (d) => {
          return +d[maxColumn] === +d[minColumn]
            ? y(d.name) + y.bandwidth() / 2 - 9
            : y(d.name) + y.bandwidth() / 2;
        })
        .attr("y2", (d) => {
          return +d[maxColumn] === +d[minColumn]
            ? y(d.name) + y.bandwidth() / 2 + 9
            : y(d.name) + y.bandwidth() / 2;
        })
        .attr("stroke", (d) => {
          return +d[maxColumn] === +d[minColumn]
            ? ONScolours.grey50
            : +d[maxColumn] < +d[minColumn]
            ? config.colourPaletteArrows[0]
            : config.colourPaletteArrows[1];
        })
        .attr("stroke-width", (d) => {
          return +d[maxColumn] === +d[minColumn] ? "4px" : "3px";
        })
        .attr("marker-end", (d) =>
          +d[maxColumn] === +d[minColumn] ? null : "url(#annotation_arrowhead)"
        );
    }

    // Draw circles for value (range chart)
    if (chartType === "range" || chartType === "dot") {
      svg
        .selectAll("circle.value")
        .data(data)
        .join("circle")
        .attr("class", "value")
        .attr("cx", (d) => x(d[minColumn]))
        .attr("cy", (d) => y(d.name) + y.bandwidth() / 2)
        .attr("r", 6)
        .attr("fill", config.colourPaletteDots[0])
        .attr("stroke", config.colourPaletteDotsStroke[0])
        .attr("stroke-width", "1.5px");
    }

    // Draw diamond markers for reference values (bar and range charts only)
    if (chartType === "bar" || chartType === "range" || chartType === "dot") {
      svg
        .selectAll("path.refmarker")
        .data(data)
        .join("path")
        .attr("class", "refmarker diamondStyle")
        .attr("d", diamondShape(10)) // Adjust size as needed
        .attr(
          "transform",
          (d) =>
            `translate(${x(d[maxColumn])}, ${y(d.name) + y.bandwidth() / 2})`
        )
        .attr(
          "fill",
          chartType === "bar" ? "white" : config.colourPaletteDots[1]
        )
        .attr(
          "stroke",
          chartType === "bar" ? ONScolours.black : config.colourPaletteDotsStroke[1]
        )
        .attr("stroke-width", "1.5px");
    }


    // Data labels logic (match regular script: adjust color for contrast, position, etc.)
    function shouldShowDataLabels() {
      if (config.dataLabels.show === false) return false;
      if (config.dataLabels.show === true) return true;
      if (config.dataLabels.show === "desktopOnly") return size === "lg";
      return false;
    }

    if (shouldShowDataLabels() && ["range", "arrow", "dot"].includes(chartType)) {
      // minColumn label (diamond)
      svg
        .selectAll("text.min")
        .data(data)
        .join("text")
        .attr("class", "dataLabels")
        .attr("x", (d) => x(d[minColumn]))
        .attr("y", (d) => {
          if (chartType === "range" || chartType === "dot") {
            // If dots are close, offset vertically
            return Math.abs(x(d[maxColumn]) - x(d[minColumn])) < 3
              ? y(d.name) - 5
              : y(d.name) + y.bandwidth() / 2;
          } else {
            return y(d.name) + y.bandwidth() / 2;
          }
        })
        .text((d) => d3.format(config.dataLabels.numberFormat)(d[minColumn]))
        .attr("fill", (d) => {
          if (chartType === "arrow") {
            if (+d[minColumn] === +d[maxColumn]) {
              return "#999";
            } else if (+d[minColumn] < +d[maxColumn]) {
              return adjustColorForContrast(config.colourPaletteArrows[1], 4.5);
            } else {
              return adjustColorForContrast(config.colourPaletteArrows[0], 4.5);
            }
          } else if (chartType === "bar") {
            return adjustColorForContrast(config.colourPaletteBar, 4.5);
          } else {
            return adjustColorForContrast(config.colourPaletteDots[0], 4.5);
          }
        })
        .style("font-weight", "600")
        .attr("dy", 6)
        .attr("dx", (d) => {
          if (chartType === "arrow") {
            return +d[minColumn] <= +d[maxColumn] ? -10 : 10;
          } else {
            return -10;
          }
        })
        .attr("text-anchor", (d) => {
          if (chartType === "arrow") {
            return +d[minColumn] <= +d[maxColumn] ? "end" : "start";
          } else {
            return "end";
          }
        });

      // maxColumn label (dot/circle)
      svg
        .selectAll("text.max")
        .data(data)
        .join("text")
        .attr("class", "dataLabels")
        .attr("x", (d) => x(d[maxColumn]))
        .attr("y", (d) => {
          if (chartType === "range" || chartType === "dot") {
            return Math.abs(x(d[maxColumn]) - x(d[minColumn])) < 3
              ? y(d.name) + 15
              : y(d.name) + y.bandwidth() / 2;
          } else {
            return y(d.name) + y.bandwidth() / 2;
          }
        })
        .text((d) => d3.format(config.dataLabels.numberFormat)(d[maxColumn]))
        .attr("fill", (d) => {
          if (chartType === "arrow") {
            if (+d[minColumn] === +d[maxColumn]) {
              return "#999";
            } else if (+d[minColumn] < +d[maxColumn]) {
              return adjustColorForContrast(config.colourPaletteArrows[1], 4.5);
            } else {
              return adjustColorForContrast(config.colourPaletteArrows[0], 4.5);
            }
          } else if (chartType === "bar") {
            return adjustColorForContrast(config.colourPaletteBar, 4.5);
          } else {
            return adjustColorForContrast(config.colourPaletteDots[1], 4.5);
          }
        })
        .style("font-weight", chartType === "arrow" ? "700" : "600")
        .attr("dy", 6)
        .attr("dx", (d) => {
          if (chartType === "arrow") {
            return +d[minColumn] > +d[maxColumn] ? -10 : 10;
          } else {
            return 10;
          }
        })
        .attr("text-anchor", (d) => {
          if (chartType === "arrow") {
            return +d[minColumn] > +d[maxColumn] ? "end" : "start";
          } else {
            return "start";
          }
        });
    }

    // This does the chart title label
    addChartTitleLabel({
      svgContainer: svg,
      text: seriesName,
      wrapWidth: chart_width,
    });

    // This does the x-axis label
    if (
      chartIndex % chartsPerRow === chartsPerRow - 1 ||
      chartIndex === [...nested_data].length - 1
    ) {
      addAxisLabel({
        svgContainer: svg,
        xPosition: chart_width,
        yPosition: height + 35,
        text: config.xAxisLabel,
        wrapWidth: chart_width,
      });
    }
  }

  // Draw the charts for each small multiple
  chartContainers.each(function ([key, value], i) {
    drawChart(d3.select(this), key, value, i);
  });

  // When the arrow change is small, draw a comet-style legend in #legend
  // instead of the inline labels above the first data row.
  if (chartType === "arrow" && !useInlineLegend) {
    drawArrowCometLegend({
      legendContainer: legend,
      minColumn,
      maxColumn,
      colourPaletteArrows: config.colourPaletteArrows,
    });
  }

  //create link to source
  d3.select("#source").text("Source: " + config.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.graphicDataUrl).then((data) => {
  //load chart data
  graphic_data = data;
  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});

// window.onresize = drawGraphic
