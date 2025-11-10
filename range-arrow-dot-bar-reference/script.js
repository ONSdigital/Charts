import {
  initialise,
  wrap,
  addSvg,
  addAxisLabel,
  diamondShape,
  adjustColorForWhiteContrast,
} from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let legend = d3.select("#legend");
let pymChild = null;
let graphic_data, size, groups, xDomain, divs, svgs, charts;

let extraMarginTop = 0;

// Determine chart type - default to 'range' if not specified
const chartType = config.chartType || "range";

// Add extra margin for arrow chart legend
if (chartType === "arrow") {
  extraMarginTop = 12;
} else {
  extraMarginTop = 0;
}

function setupArrowhead(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs
    .append("svg:marker")
    .attr("id", "annotation_arrowhead")
    .attr("class", "arrowheadMarker")
    .attr("refX", 3.27)
    .attr("refY", 3.86)
    // .attr('opacity',0.3)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadMarker
    .append("path")
    .attr("stroke", "context-stroke")
    .attr("fill", "none")
    .attr("d", "M0.881836 1.45544L3.27304 3.84665L0.846591 6.2731");
}

function drawGraphic() {
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.margin[size];

  let chart_width =
    parseInt(graphic.style("width")) - margin.left - margin.right;

  groups = d3.groups(graphic_data, (d) => d.group);

  // Get column names for min and max (assuming they are columns 3 and 4, indices 2 and 3)
  let minColumn = graphic_data.columns[2];
  let maxColumn = graphic_data.columns[3];

  if (config.xDomain == "auto") {
    // Calculate domain based on both min and max columns
    let minValue = d3.min([
      d3.min(graphic_data, (d) => +d[minColumn]),
      d3.min(graphic_data, (d) => +d[maxColumn]),
    ]);
    let maxValue = d3.max([
      d3.max(graphic_data, (d) => +d[minColumn]),
      d3.max(graphic_data, (d) => +d[maxColumn]),
    ]);

    if (chartType === "bar") {
      minValue = Math.min(minValue, 0);
      maxValue = Math.max(maxValue, 0);
    }
    xDomain = [minValue, maxValue];
  } else {
    xDomain = config.xDomain;
  }

  //set up scales
  const x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);

  const colour = d3
    .scaleOrdinal()
    .range(config.colourPaletteDots)
    .domain([maxColumn, minColumn]);

  const strokeColour = d3
    .scaleOrdinal()
    .range(config.colourPaletteDotsStroke)
    .domain([maxColumn, minColumn]);

  // create the y scale in groups
  groups.map(function (d) {
    //height
    d[2] = config.seriesHeight[size] * d[1].length;

    // y scale
    d[3] = d3
      .scalePoint()
      .padding(0.5)
      .range([0, d[2]])
      .domain(d[1].map((d) => d.name));
    //y axis generator
    d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
  });

  //set up xAxis generator
  let xAxis = d3
    .axisBottom(x)
    .ticks(config.xAxisTicks[size])
    .tickFormat(d3.format(config.xAxisTickFormat));

  divs = graphic.selectAll("div.categoryLabels").data(groups).join("div");
  if (groups.length > 1) {
    divs
      .append("p")
      .attr("class", "groupLabels")
      .html((d) => d[0]);
  }

  charts = divs
    .selectAll("svg")
    .data((d, i) => [Object.assign(d, { groupIndex: i })])
    .join("svg")
    .attr("width", chart_width + margin.left + margin.right)
    .attr("height", (d) => {
      const extraTopMargin = d.groupIndex === 0 ? extraMarginTop : 0;
      return d[2] + margin.top + margin.bottom + extraTopMargin;
    })
    .attr("class", "chart")
    .append("g")
    .attr("transform", (d) => {
      const extraTopMargin = d.groupIndex === 0 ? extraMarginTop : 0;
      const topMargin = margin.top + extraTopMargin;
      return `translate(${margin.left}, ${topMargin})`;
    });

  charts.each(function (d) {
    d3.select(this)
      .append("g")
      .attr("class", "y axis")
      .call(d[4])
      .selectAll("text")
      .call(wrap, margin.left - 10);

    d3.select(this)
      .append("g")
      .attr("transform", (d) => "translate(0," + d[2] + ")")
      .attr("class", "x axis")
      .each(function () {
        d3.select(this)
          .call(xAxis.tickSize(-d[2]))
          .selectAll("line")
          .each(function (e) {
            if (e == 0) {
              d3.select(this).attr("class", "zero-line");
            }
          });
      });
  });
  setupArrowhead(d3.select(".chart"));

  if (
    chartType === "dot" ||
    (chartType === "range" && config.showGuidelines?.range) ||
    (chartType === "arrow" && config.showGuidelines?.arrow)
  ) {
    charts
      .selectAll("line.guideline")
      .data((d) => d[1])
      .join("line")
      .attr("class", "guideline")
      .attr("x1", x(xDomain[0]))
      .attr("x2", x(xDomain[1]))
      .attr("y1", (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
      .attr("y2", (d, i) =>
        groups.filter((e) => e[0] == d.group)[0][3](d.name)
      );
  }

  if (chartType === "bar") {
    charts
      .selectAll("bar")
      .data((d) => d[1])
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => (d[maxColumn] < 0 ? x(d[maxColumn]) : x(0)))
      .attr(
        "y",
        (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) - 15
      )
      .attr("width", (d) => Math.abs(x(d[maxColumn]) - x(0)))
      .attr("height", "30px")
      .attr("fill", config.colourPaletteBar);
  }

  if (chartType === "arrow") {
    charts.each(function (groupData, groupIndex) {
      if (groupData.groupIndex === 0 && groupData[1].length > 0) {
        // Get the first data point in the first group
        const firstDataPoint = groupData[1][0];
        const svg = d3.select(this);

        // Get the y position of the first arrow
        const yPos = groupData[3](firstDataPoint.name);

        // Add label for min value (left side)
        svg
          .append("text")
          .attr("class", "arrowLegend")
          .attr("x", x(firstDataPoint[minColumn]))
          .attr("y", yPos - 20) // Position above the arrow (adjust as needed)
          .attr("text-anchor", (d) =>
            firstDataPoint[maxColumn] < firstDataPoint[minColumn]
              ? "start"
              : "end"
          )
          .text(minColumn);

        // Add label for max value (right side) - only if values are different
        if (+firstDataPoint[minColumn] !== +firstDataPoint[maxColumn]) {
          svg
            .append("text")
            .attr("class", "arrowLegend")
            .attr("x", x(firstDataPoint[maxColumn]))
            .attr("y", yPos - 20) // Position above the arrow (adjust as needed)
            .attr("text-anchor", (d) =>
              firstDataPoint[maxColumn] < firstDataPoint[minColumn]
                ? "end"
                : "start"
            )
            // .attr('text-anchor', 'start')
            .text(maxColumn);
        }

        // Optional: Add connecting lines to show which label goes to which end
        // Line to min value
        svg
          .append("line")
          .attr("class", "legendConnector")
          .attr("x1", x(firstDataPoint[minColumn]))
          .attr("x2", x(firstDataPoint[minColumn]))
          .attr("y1", yPos - 15) // Start just below the text
          .attr("y2", yPos - 5); // End just above the arrow

        // Line to max value (only if values are different)
        if (+firstDataPoint[minColumn] !== +firstDataPoint[maxColumn]) {
          svg
            .append("line")
            .attr("class", "legendConnector")
            .attr("x1", x(firstDataPoint[maxColumn]))
            .attr("x2", x(firstDataPoint[maxColumn]))
            .attr("y1", yPos - 15) // Start just below the text
            .attr("y2", yPos - 5); // End just above the arrow
        }
      }
    });
  }

  if (chartType === "arrow") {
    charts
      .selectAll("line.arrowline")
      .data((d) => d[1])
      .join("line")
      .attr("class", "between")
      .attr("x1", (d) => x(d[minColumn]))
      .attr("x2", (d) => {
        return +d[minColumn] === +d[maxColumn]
          ? x(d[minColumn])
          : x(d[maxColumn]);
      })
      .attr("y1", (d) => {
        return +d[minColumn] === +d[maxColumn]
          ? groups.filter((e) => e[0] == d.group)[0][3](d.name) - 9
          : groups.filter((e) => e[0] == d.group)[0][3](d.name);
      })
      .attr("y2", (d) => {
        return +d[minColumn] === +d[maxColumn]
          ? groups.filter((e) => e[0] == d.group)[0][3](d.name) + 9
          : groups.filter((e) => e[0] == d.group)[0][3](d.name);
      })
      .attr("stroke", (d) => {
        return +d[minColumn] === +d[maxColumn]
          ? "#999"
          : +d[minColumn] < +d[maxColumn]
          ? "#206095"
          : "#f66068";
      })
      .attr("stroke-width", (d) => {
        return +d[minColumn] === +d[maxColumn] ? "4px" : "3px";
      })
      .attr("marker-end", (d) =>
        +d[minColumn] === +d[maxColumn] ? null : "url(#annotation_arrowhead)"
      );
  }

  if (chartType === "range") {
    charts
      .selectAll("line.between")
      .data((d) => d[1])
      .join("line")
      .attr("class", "between")
      .attr("x1", (d) => x(d[minColumn]))
      .attr("x2", (d) => x(d[maxColumn]))
      .attr("y1", (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
      .attr("y2", (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
      .attr("stroke", "#c6c6c6")
      .attr("stroke-width", "3px");
  }

  let adjustWhenClose = 0;
  if (chartType === "range" || chartType === "dot") {
    adjustWhenClose = 5;
  } else {
    adjustWhenClose = 0;
  }

  if (chartType === "range" || chartType === "dot") {
    charts
      .selectAll("circle.max")
      .data((d) => d[1])
      .join("circle")
      .attr("class", "max")
      .attr("cx", (d) => x(d[maxColumn]))
      .attr("cy", (d) =>
        Math.abs(x(d[maxColumn]) - x(d[minColumn])) < 3
          ? groups.filter((f) => f[0] == d.group)[0][3](d.name) +
            adjustWhenClose
          : groups.filter((f) => f[0] == d.group)[0][3](d.name)
      )
      .attr("r", 6)
      .attr("fill", colour("max"))
      .attr("stroke", strokeColour("max"))
      .attr("stroke-width", "1.5px");
  }

  if (chartType === "range" || chartType === "bar" || chartType === "dot") {
    charts
      .selectAll("path.min")
      .data((d) => d[1])
      .join("path")
      .attr("class", "min diamondStyle")
      .attr("d", diamondShape(10))
      .attr(
        "transform",
        (d) =>
          `translate(${x(d[minColumn])}, ${
            Math.abs(x(d[maxColumn]) - x(d[minColumn])) < 3
              ? groups.filter((f) => f[0] == d.group)[0][3](d.name) -
                adjustWhenClose
              : groups.filter((f) => f[0] == d.group)[0][3](d.name)
          })`
      )
      .attr("fill", () => {
        return chartType === "bar" ? "white" : colour("min");
      })
      .attr("stroke", () => {
        return chartType === "bar" ? "#222" : strokeColour("min");
      })
      .attr("stroke-width", () => {
        return chartType === "bar" ? "1.5px" : "1.5px";
      });
  }

  //dataLabels
  function shouldShowDataLabels() {
    // If showDataLabels is explicitly false, never show
    if (config.showDataLabels === false) {
      return false;
    }

    // If showDataLabels is true, always show
    if (config.showDataLabels === true) {
      return true;
    }

    // If showDataLabels is 'desktop', only show on large screens
    if (config.showDataLabels === "desktopOnly") {
      return size === "lg";
    }

    // Default fallback
    return false;
  }

  //dataLabels
  if (shouldShowDataLabels() && ["range", "arrow", "dot"].includes(chartType)) {
    charts
      .selectAll("text.min")
      .data((d) => d[1])
      .join("text")
      .attr("class", "dataLabels")
      .attr("x", (d) => x(d[minColumn]))
      .attr("y", (d) =>
        Math.abs(x(d[maxColumn]) - x(d[minColumn])) < 3
          ? groups.filter((f) => f[0] == d.group)[0][3](d.name) -
            adjustWhenClose
          : groups.filter((f) => f[0] == d.group)[0][3](d.name)
      )
      .text((d) => d3.format(config.numberFormat)(d[minColumn]))
      .attr("fill", (d) => {
        if (chartType === "arrow") {
          if (+d[minColumn] === +d[maxColumn]) {
            return "#999";
          } else if (+d[minColumn] < +d[maxColumn]) {
            return "#206095";
          } else {
            return "#f66068";
          }
        } else {
          return adjustColorForWhiteContrast(colour("min"), 4.5);
        }
      })
      .style("font-weight", "600")

      .attr("dy", 6)
      .attr("dx", (d) => (+d[minColumn] <= +d[maxColumn] ? -10 : 10))
      .attr("text-anchor", (d) =>
        +d[minColumn] <= +d[maxColumn] ? "end" : "start"
      );

    charts
      .selectAll("text.max")
      .data((d) => d[1])
      .join("text")
      .attr("class", "dataLabels")
      .attr("x", (d) => x(d[maxColumn]))
      .attr("y", (d) =>
        Math.abs(x(d[maxColumn]) - x(d[minColumn])) < 3
          ? groups.filter((f) => f[0] == d.group)[0][3](d.name) +
            adjustWhenClose
          : groups.filter((f) => f[0] == d.group)[0][3](d.name)
      )
      .text((d) => d3.format(config.numberFormat)(d[maxColumn]))
      .attr("fill", (d) => {
        if (chartType === "arrow") {
          if (+d[minColumn] === +d[maxColumn]) {
            return "#999"; // neutral color for no change
          } else if (+d[minColumn] < +d[maxColumn]) {
            return "#206095"; // up arrow color
          } else {
            return "#f66068"; // down arrow color
          }
        } else {
          return adjustColorForWhiteContrast(colour("max"), 4.5);
        }
      })

      .attr("dy", 6)
      .attr("dx", (d) => (+d[minColumn] > +d[maxColumn] ? -10 : 10))
      .attr("text-anchor", (d) =>
        +d[minColumn] > +d[maxColumn] ? "end" : "start"
      )
      .style("font-weight", () => {
        return chartType === "arrow" ? "700" : "600";
      });
  }

  // This does the x-axis label
  charts.each(function (d, i) {
    if (i == groups.length - 1) {
      addAxisLabel({
        svgContainer: d3.select(this),
        xPosition: chart_width,
        yPosition: d[2] + 35,
        text: config.xAxisLabel,
        textAnchor: "end",
        wrapWidth: chart_width,
      });
    }
  });

  // Set up the legend using column headings

  if (chartType === "range" || chartType === "dot" || chartType === "bar") {
    let legendLabels = [maxColumn, minColumn]; // Use actual column names from dataset
    let legendColors = [colour("max"), colour("min")]; // Get colors for max and min

    let legendContainer = d3.select("#legend");

    let legenditem = legendContainer
      .selectAll("div.legend--item")
      .data(d3.zip(legendLabels, legendColors))
      .enter()
      .append("div")
      .attr("class", "legend--item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "0px");

    // Create SVG for legend icons
    let legendSvg = legenditem
      .append("svg")
      .attr("width", 18)
      .attr("height", 18)
      .style("margin-right", "0px")
      .style("flex-shrink", "0");

    // Add the appropriate shapes based on chart type
    legendSvg.each(function (d, i) {
      const svg = d3.select(this);
      const label = d[0];
      const color = d[1];

      if (label === maxColumn) {
        // Circle for max values
        svg
          .append("circle")
          .attr("cx", 10)
          .attr("cy", 10)
          .attr("r", 6)
          .attr("fill", chartType === "bar" ? config.colourPaletteBar : color)
          .attr("stroke", () => {
            return chartType === "bar" ? "none" : strokeColour("max");
          })
          .attr("stroke-width", chartType === "bar" ? "1.5px" : "1.5px");
      } else if (label === minColumn) {
        // Diamond for min values
        svg
          .append("path")
          .attr("class", "diamondStyle")
          .attr("d", diamondShape(10))
          .attr("transform", "translate(10, 10)")
          .attr("fill", chartType === "bar" ? "white" : color)
          .attr("stroke", () => {
            return chartType === "bar" ? "#222" : strokeColour("min");
          })
          .attr("stroke-width", chartType === "bar" ? "1.5px" : "1.5px");
      }
    }); // Add legend text
    legenditem
      .append("div")
      .append("p")
      .attr("class", "legend--text")
      .style("margin", "0")
      .html(function (d) {
        return d[0];
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
