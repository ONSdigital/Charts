import { initialise, wrap, addSvg, addAxisLabel, addDataLabels, addSource } from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let pymChild = null;
let graphicData, size, svg;


function drawGraphic() {
  // Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  // To override breakpoints, pass as: initialise(size, { mediumBreakpoint: 500 })
  size = initialise(size);

  let margin = config.margin[size];
  console.log("margin object:", margin);
  // console.log("margin.right:", margin.right);
  let chartWidth =
    parseInt(graphic.style("width")) - margin.left - margin.bubble - 20;
  // console.log("chartWidth:", chartWidth);
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
    margin: { ...margin, right: margin.bubble + margin.right }
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
    .attr("fill", (d) => d.value >= 0 ? config.colourPalettePositive : config.colourPaletteNegative);

  // Add context bubbles
  const maxRadius = margin.bubble / 1.85;
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

  //This does the x-axis title at the top for bars
  svg
    .append("g")
    .append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("class", "axis--label")
    .text(config.xAxisTitle)
    .attr("text-anchor", "start");

  //This does the x-axis label below the x-axis
  svg
    .append("g")
    .append("text")
    .attr("x", chartWidth)
    .attr("y", height + 35)
    .attr("class", "axis--label")
    .text(config.xAxisLabel)
    .attr("text-anchor", "end");

  //This does the bubble label at the top
  svg
    .append("g")
    .append("text")
    .attr("x", chartWidth + margin.bubble / 2)
    .attr("y", -10)
    .attr("class", "axis--label")
    .text(config.bubbleLabel)
    .attr("text-anchor", "middle")
    .call(wrap, margin.bubble);


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
