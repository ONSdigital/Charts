import {
  initialise,
  wrap,
  addSvg,
  calculateChartWidth,
  diamondShape,
  addChartTitleLabel,
  addAxisLabel,
} from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let legend = d3.select("#legend");
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  // Nest the graphic_data by the 'series' column
  let nested_data = d3.group(graphic_data, (d) => d.series);

  // Create a container div for each small multiple
  let chartContainers = graphic
    .selectAll(".chart-container")
    .data(Array.from(nested_data))
    .join("div")
    .attr("class", "chart-container");

  let xDataType;

  if (
    Object.prototype.toString.call(graphic_data[0].date) === "[object Date]"
  ) {
    xDataType = "date";
  } else {
    xDataType = "numeric";
  }

  // Determine which columns to use for stacked bars based on showMarkers setting
  let showMarkers =
    config.showMarkers !== undefined ? config.showMarkers : true;
  let stackColumns;

  if (showMarkers && config.lineSeries) {
    // exclude the line series from stacked bars (show as line + markers)
    stackColumns = graphic_data.columns
      .slice(2)
      .filter((d) => d !== config.lineSeries);
  } else {
    // include ALL data columns in stacked bars (no line/markers)
    stackColumns = graphic_data.columns.slice(2); // This includes the lineSeries as a stacked bar
  }

  let legendData = d3.zip(stackColumns, config.colourPalette);

  function drawChart(container, seriesName, data, chartIndex) {
    const chartEvery = config.chartEvery[size];
    const chartsPerRow = config.chartEvery[size];
    let chartPosition = chartIndex % chartsPerRow;

    let margin = { ...config.margin[size] };

    let chartGap = config?.chartGap || 10;

    let chart_width = calculateChartWidth({
      screenWidth: parseInt(graphic.style("width")),
      chartEvery: chartsPerRow,
      chartMargin: margin,
      chartGap: chartGap,
    });

    // If the chart is not in the first position in the row, reduce the left margin
    if (config.dropYAxis) {
      if (chartPosition !== 0) {
        margin.left = chartGap;
      }
    }

    const aspectRatio = config.aspectRatio[size];

    //height is set by the aspect ratio
    let height = (aspectRatio[1] / aspectRatio[0]) * chart_width;

    //set up scales
    const y = d3.scaleLinear().range([height, 0]);

    const x = d3
      .scaleBand()
      .paddingOuter(0.0)
      .paddingInner(0.1)
      .range([0, chart_width])
      .round(false);

    const colour = d3
      .scaleOrdinal()
      .domain(stackColumns) // Use stackColumns instead of all columns
      .range(config.colourPalette);

    //use the data to find unique entries in the date column
    x.domain([...new Set(graphic_data.map((d) => d.date))]);

    //set up yAxis generator
    const yAxis = d3
      .axisLeft(y)
      .tickSize(-chart_width)
      .tickPadding(10)
      .ticks(config.yAxisTicks[size])
      .tickFormat((d) =>
        config.dropYAxis !== true
          ? d3.format(config.yAxisTickFormat)(d)
          : chartPosition == 0
          ? d3.format(config.yAxisTickFormat)(d)
          : ""
      );

    // Use stackColumns for the stack instead of filtering out lineSeries
    const stack = d3
      .stack()
      .keys(stackColumns)
      .offset(d3[config.stackOffset])
      .order(d3[config.stackOrder]);

    const series = stack(data);
    const seriesAll = stack(graphic_data);

    let xTime = d3.timeFormat(config.xAxisTickFormat[size]);

    //set up xAxis generator
    const xAxis = d3
      .axisBottom(x)
      .tickSize(10)
      .tickPadding(10)
      .tickValues(
        xDataType == "date"
          ? graphic_data
              .map(function (d) {
                return d.date.getTime();
              }) //just get dates as seconds past unix epoch
              .filter(function (d, i, arr) {
                return arr.indexOf(d) == i;
              }) //find unique
              .map(function (d) {
                return new Date(d);
              }) //map back to dates
              .sort(function (a, b) {
                return a - b;
              })
              .filter(function (d, i) {
                return (
                  (i % config.xAxisTicksEvery[size] === 0 &&
                    i <= graphic_data.length - config.xAxisTicksEvery[size]) ||
                  i == data.length - 1
                ); //Rob's fussy comment about labelling the last date
              })
          : x.domain().filter((d, i) => {
              return (
                (i % config.xAxisTicksEvery[size] === 0 &&
                  i <= graphic_data.length - config.xAxisTicksEvery[size]) ||
                i == data.length - 1
              );
            })
      )
      .tickFormat((d) =>
        xDataType == "date" ? xTime(d) : d3.format(config.xAxisNumberFormat)(d)
      );

    //create svg for chart
    const svg = addSvg({
      svgParent: container,
      chartWidth: chart_width,
      height: height + margin.top + margin.bottom,
      margin: margin,
    });

    if (config.yDomain == "auto") {
      y.domain(d3.extent(seriesAll.flat(2))); //flatten the arrays and then get the extent
    } else {
      y.domain(config.yDomain);
    }

    //gets array of arrays for individual lines
    let lines = [];
    for (let column in graphic_data[0]) {
      if (column == "date" || column == "series") continue;
      lines[column] = data.map(function (d) {
        return {
          name: d.date,
          amt: d[column],
        };
      });
    }

    let counter;
    // do some code to overwrite blanks with the last known point
    let keys = Object.keys(lines);
    for (let i = 0; i < keys.length; i++) {
      lines[keys[i]].forEach(function (d, j) {
        if (d.amt != "null") {
          counter = j;
        } else {
          d.name = lines[keys[i]][counter].name;
          d.amt = lines[keys[i]][counter].amt;
        }
      });
    }

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y axis numeric") //Can be numeric or categorical
      .call(yAxis)
      .selectAll("line")
      .each(function (d) {
        if (d == 0) {
          d3.select(this).attr("class", "zero-line");
        }
      })
      .selectAll("text")
      .call(wrap, margin.left - 10);

    //Columns - draw all stacked bars
    svg
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", (d, i) => config.colourPalette[i])
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("y", (d) => Math.min(y(d[0]), y(d[1])))
      .attr("x", (d) => x(d.data.date))
      .attr("height", (d) => Math.abs(y(d[0]) - y(d[1])))
      .attr("width", x.bandwidth());

    // Only draw line and markers if showMarkers is true
    if (showMarkers && config.lineSeries) {
      let thisCurve = d3.curveLinear;

      let line = d3
        .line()
        .defined((d) => d.amt !== "null")
        .curve(thisCurve)
        .x((d) => x(d.name))
        .y((d) => y(d.amt));

      let line_values = Object.entries(lines).filter(
        (d) => d[0] == config.lineSeries
      );

      // Draw line if showLine is true
      if (config.showLine === true) {
        svg
          .append("g")
          .selectAll("path")
          .data(line_values)
          .enter()
          .append("path")
          .attr("stroke", (d, i) => config.lineColour)
          .attr("class", "dataLine")
          .attr("d", (d) => line(d[1]))
          .attr("transform", "translate(" + x.bandwidth() / 2 + ",0)");
      }

      // Draw diamond markers
      svg
        .append("g")
        .selectAll("g")
        .data(line_values)
        .enter()
        .append("g")
        .attr("transform", "translate(" + x.bandwidth() / 2 + ",0)")
        .selectAll("path")
        .data((d) => d[1])
        .enter()
        .append("path")
        .attr("d", diamondShape(8))
        .attr("transform", (d) => `translate(${x(d.name)}, ${y(d.amt)})`)
        .attr("stroke", config.lineColour)
        .attr("class", "diamondStyle");
    }

    // This does the chart title label
    addChartTitleLabel({
      svgContainer: svg,
      yPosition: -30,
      text: seriesName,
      wrapWidth: chart_width,
    });

    // This does the y-axis label
    addAxisLabel({
      svgContainer: svg,
      xPosition: 5 - margin.left,
      yPosition: -10,
      text: chartIndex % chartEvery == 0 ? config.yAxisLabel : "",
      textAnchor: "start",
      wrapWidth: chart_width,
    });
  }

  // Draw the charts for each small multiple
  chartContainers.each(function ([key, value], i) {
    drawChart(d3.select(this), key, value, i);
  });

  // Clear existing legend before creating new one
  d3.select("#legend").selectAll("*").remove();

  // Set up the legend for stacked bars
  let legenditem = d3
    .select("#legend")
    .selectAll("div.legend--item")
    .data(legendData)
    .enter()
    .append("div")
    .attr("class", "legend--item");

  // Create SVG for legend icons instead of divs
  legenditem
    .append("svg")
    .attr("class", "legend--icon--svg")
    .attr("width", 16)
    .attr("height", 16)
    .append("circle")
    .attr("r", 6)
    .attr("cx", 8)
    .attr("cy", 8)
    .attr("fill", function (d) {
      return d[1];
    });

  legenditem
    .append("div")
    .append("p")
    .attr("class", "legend--text")
    .html(function (d) {
      return d[0];
    });

  // Only add line legend if showMarkers is true
  if (showMarkers && config.lineSeries) {
    let lineLegendItem = d3
      .select("#legend")
      .append("div")
      .attr("class", "legend--item line");

    // Create SVG for line legend icon
    let lineSvg = lineLegendItem
      .append("svg")
      .attr("class", "legend--icon--svg")
      .attr("width", 24)
      .attr("height", 18);

    // Add horizontal line if showLine is true
    if (config.showLine === true) {
      lineSvg
        .append("line")
        .attr("x1", 2)
        .attr("x2", 21)
        .attr("y1", 8)
        .attr("y2", 8)
        .attr("class", "dataLine")
        .attr("stroke", config.lineColour)
        .attr("stroke-width", "3px");
    }

    // Add diamond marker on top
    lineSvg
      .append("path")
      .attr("d", diamondShape(8))
      .attr("transform", "translate(12, 8)")
      .attr("stroke", config.lineColour)
      .attr("class", "diamondStyle");

    lineLegendItem
      .append("div")
      .attr("class", "legend--text")
      .text(config.lineSeries);
  }

  if (size !== "sm") {
    d3.select("#legend").style(
      "grid-template-columns",
      `repeat(${config.legendColumns}, 1fr)`
    );
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

  let parseTime = d3.timeParse(config.dateFormat);

  data.forEach((d, i) => {
    //If the date column is has date data store it as dates
    if (parseTime(data[i].date) !== null) {
      d.date = parseTime(d.date);
    }
  });

  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
