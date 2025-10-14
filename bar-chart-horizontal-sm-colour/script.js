import { initialise, wrap, addSvg, calculateChartWidth, addAxisLabel, addSource } from "../lib/helpers.js";

let pymChild = null;
let graphic = d3.select("#graphic");
let graphicData, size, svg;

//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
size = initialise(size);

function drawGraphic(seriesName, graphicData, chartIndex) {

  const chartsPerRow = config.chartEvery[size];
  const chartPosition = chartIndex % chartsPerRow;

  // Set dimensions
  let margin = { ...config.margin[size] };

  let height =
    config.seriesHeight[size] * graphicData.length +
    10 * (graphicData.length - 1) +
    12;

  let chartGap = config.chartGap || 10;

  let chart_width = calculateChartWidth({
    screenWidth: parseInt(graphic.style('width')),
    chartEvery: chartsPerRow,
    chartMargin: margin,
    chartGap: chartGap
  })

  // If the chart is not in the first position in the row, reduce the left margin
  if (config.dropYAxis) {
    if (chartPosition !== 0) {
      margin.left = chartGap;
    }
  }

  // Calculate the total available width for two charts in a row
  const containerWidth = parseInt(graphic.style("width"));
  const availableWidth = containerWidth - margin.left - margin.right;

  // Calculate the chart width for two charts in a row, accounting for spacing
  const chartWidthPerRow = availableWidth / chartsPerRow;

  // Adjust the chart width based on the available space and desired grid layout
  chart_width = Math.min(chartWidthPerRow, chart_width);
  chart_width *= 1;

  // Calculate the row index and column index based on chart position
  const rowIndex = Math.floor(chartIndex / chartsPerRow);
  const colIndex = chartIndex % chartsPerRow;

  // Calculate the translation for positioning the chart in the grid
  const translateX = colIndex * (chartWidthPerRow + 10);
  const translateY = rowIndex * (height + margin.top + margin.bottom);


  // Define scales
  const x = d3.scaleLinear().range([0, chart_width]);

  const y = d3
    .scaleBand()
    .paddingOuter(0.2)
    .paddingInner(((graphicData.length - 1) * 10) / (graphicData.length * 30))
    .range([0, height])
    .round(true);

  // Define axes
  let xAxis = d3
    .axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(config.xAxisTickFormat))
    .ticks(config.xAxisTicks[size]);

  let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

  // Define stack layout
  let stack = d3
    .stack()
    .offset(d3[config.stackOffset])
    .order(d3[config.stackOrder])
    .keys(graphicData.columns.slice(1, -1));

  const series = stack(graphicData);

  // trying a different version because d3.nice() is causing issues.
  if (config.xDomain === "auto") {
    x.domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))]);
  } else {
    x.domain([0, config.xDomain[1]]);
  }

  y.domain(graphicData.map((d) => d.name));

  // Create SVG
  let svg = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  })

  // Add axes
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


  // This will append the y axis to every chart
  svg.append("g").attr("class", "y axis").call(yAxis).remove();

  //trying to wrap text

  if (chartIndex % chartsPerRow === 0) {
    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .selectAll(".tick text")
      .call(wrap, margin.left - 10);
  } else {
    svg.append("g").attr("class", "y axis").call(yAxis.tickValues([]));
  }

  // Add a bold text label to the top left corner of the chart SVG
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", "translate(0,-30)") //this changes the height of the group label, increase if it's long
    .text(seriesName)
    .style("font-weight", "bold")
    .style("font-size", "16px")
    .style("fill", config.colourPalette[chartIndex % config.colourPalette.length])
    .call(wrap, 150);


  // Draw chart
  svg
    .selectAll("g.chart-group")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "chart-group")
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d) => x(d.data.name))
    .attr("y", (d, i) => y(graphicData[i].name))
    .attr("width", (d) => Math.abs(x(d[0]) - x(d[1])))
    .attr("height", y.bandwidth())
    .style("fill", config.colourPalette[chartIndex % config.colourPalette.length]);

  // This does the x-axis label
  if (chartIndex % chartsPerRow === chartsPerRow - 1) {
    addAxisLabel({
      svgContainer: svg,
      xPosition: chart_width,
      yPosition: height + 35,
      text: config.xAxisLabel,
      textAnchor: "end",
      wrapWidth: chart_width
    });
  }

  //create link to source
  addSource('source', config.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight(height + margin.top + margin.bottom);
  }
}

function renderCallback() {
  // Load the data
  d3.csv(config.graphicDataURL)
    .then((data) => {
      // console.log("Original data:", data);

      // Group the data by the 'series' column
      const groupedData = d3.groups(data, (d) => d.series);
      // console.log("Grouped data:", groupedData);

      //Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
      let namesArray = [...groupedData][0][1].map(d => d.name);

      // Remove previous SVGs
      graphic.selectAll("svg").remove();

      groupedData.forEach((group, i) => {
        const seriesName = group[0];
        const graphicData = group[1];

        //Sort the data so that the bars in each chart are in the same order
        graphicData.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

        graphicData.columns = data.columns;

        drawGraphic(seriesName, graphicData, i);
      });
    })
    .catch((error) => console.error(error));
}

//use pym to create iframed chart dependent on specified variables
pymChild = new pym.Child({
  renderCallback: renderCallback,
});
