import { initialise, wrap, addSvg, addAxisLabel, addDataLabels, addSource } from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.margin[size];
  let chartWidth =
    parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
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
    margin: margin
  })

  if (config.xDomain == "auto") {
    if (d3.min(graphicData.map(({ value }) => Number(value))) >= 0) {
      x.domain([0, d3.max(graphicData.map(({ value }) => Number(value)))]); //modified so it converts string to number
    } else {
      x.domain(d3.extent(graphicData.map(({ value }) => Number(value))));
    }
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

  // addYAxis(svg, margin.left-10)

  svg
    .selectAll("rect")
    .data(graphicData)
    .join("rect")
    .attr("x", (d) => (d.value < 0 ? x(d.value) : x(0)))
    .attr("y", (d) => y(d.name))
    .attr("width", (d) => Math.abs(x(d.value) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", config.colourPalette);

  // let labelPositionFactor = 7;

  if (config.dataLabels.show == true) {
    addDataLabels({
      svgContainer: svg,
      data: graphicData,
      chartWidth: chartWidth,
      labelPositionFactor: 7,
      xScaleFunction: x,
      yScaleFunction: y
    })
  } //end if for datalabels

  //This does the x-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: chartWidth,
    yPosition: height + 35,
    text: config.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chartWidth
  });


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
