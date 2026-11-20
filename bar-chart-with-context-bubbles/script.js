import { initialise, wrap, addSvg, addDataLabels, addSource, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let pymChild = null;
let graphicData, size, svg;


function drawGraphic() {
  // Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  // To override breakpoints, pass as: initialise(size, { mediumBreakpoint: 500 })
  size = initialise(size);

  let margin = config.margin[size];

  let chartWidth =
    parseInt(graphic.style("width")) - margin.left - margin.bubble - 20;

  let height =
    config.seriesHeight[size] * graphicData.length +
    10 * (graphicData.length - 1) +
    12;

  //set up scales
  const x = d3.scaleLinear().range([0, chartWidth]);

  const y = d3
    .scaleBand()
    .paddingOuter(0.2)
    .paddingInner(((graphicData.length - 1) * 10) / (graphicData.length * 30))
    .range([0, height])
    .round(true);

  //use the data to find unique entries in the name column
  y.domain([...new Set(graphicData.map((d) => d.name))]);

  //set up yAxis generator
  let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

  //set up xAxis generator
  let xAxis = d3
    .axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(config.dataLabels.numberFormat))
    .ticks(config.xAxisTicks[size]);

  //create svg for chart
  svg = addSvg({
    svgParent: graphic,
    chartWidth: chartWidth,
    height: height + margin.top + margin.bottom,
    margin: { ...margin, right: margin.bubble + margin.right }
  })

  if (config.xDomain == "auto") {
    const [minValue, maxValue] = d3.extent(graphicData, ({ value }) => Number(value));
    x.domain([Math.min(0, minValue), Math.max(0, maxValue)]);
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

  svg
    .selectAll("rect")
    .data(graphicData)
    .join("rect")
    .attr("x", (d) => (d.value < 0 ? x(d.value) : x(0)))
    .attr("y", (d) => y(d.name))
    .attr("width", (d) => Math.abs(x(d.value) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => d.value >= 0 ? config.colourPalettePositive : config.colourPaletteNegative);

  // Add context bubbles
  const maxRadius = (margin.bubble / 1.85) * config.bubbleScale;
  const maxValueBubble = d3.max(graphicData, d => Math.abs(d.value1));

  function calculateRadius(value) {
    const areaScaleFactor = Math.pow(maxRadius, 2);
    return Math.sqrt((Math.abs(value) / maxValueBubble) * areaScaleFactor / Math.PI);
  }

  svg
    .selectAll("circle")
    .data(graphicData)
    .join("circle")
    .attr("cx", chartWidth + margin.bubble / 2)
    .attr("cy", (d) => y(d.name) + y.bandwidth() / 2)
    .attr("r", d => calculateRadius(d.value1))
    .attr("fill", config.colourPaletteBubble)
    .attr("fill-opacity", 0.2)
    .attr("stroke", config.colourPaletteBubble)
    .attr("stroke-opacity", 0.4);

  svg
    .selectAll("text.bubbleLabels")
    .data(graphicData)
    .join("text")
    .attr("class", "bubbleLabels")
    .attr("x", chartWidth + margin.bubble / 2)
    .attr("dx", 0)
    .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("fill", "#414042")
    .text((d) => {
      if (!d.value1 || d.value1 === "" || d.value1 === "0%" || d.value1 === 0) return "";
      return isNaN(d.value1) ? "Not applicable" : d3.format(config.dataLabelsBubbleFormat)(d.value1);
    });



  if (config.dataLabels.show == true) {
    const labelColours = d3.scaleOrdinal()
      .domain(graphicData.map(d => d.name))
      .range(graphicData.map(d => d.value >= 0 ? config.colourPalettePositive : config.colourPaletteNegative));

    addDataLabels({
      svgContainer: svg,
      data: graphicData,
      chartWidth: chartWidth,
      labelPositionFactor: 7,
      xScaleFunction: x,
      yScaleFunction: y,
      colourScale: labelColours,
      requiredContrast: 4.5
    })
  } //end if for datalabels

  //This does the x-axis title at the top for bars
  addAxisLabel({
    svgContainer: svg,
    xPosition: 0,
    yPosition: -10,
    text: config.xAxisTitle,
    textAnchor: 'start'
  })

  //This does the x-axis label below the x-axis
  addAxisLabel({
    svgContainer: svg,
    xPosition: chartWidth,
    yPosition: height + 35,
    text: config.xAxisLabel,
    textAnchor: 'end'
  })

  //This does the bubble label at the top
  addAxisLabel({
    svgContainer: svg,
    xPosition: chartWidth + margin.bubble / 2,
    yPosition: -10,
    text: config.bubbleLabel,
    textAnchor: 'middle',
    wrapWidth: margin.bubble
  })

  //create link to source
  addSource('source', config.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.graphicDataURL).then((data) => {
  //load chart data
  graphicData = data;

  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
