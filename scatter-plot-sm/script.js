import { initialise, wrap, addSvg, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, nested_data, svg;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  //group data on the basis of plot
  nested_data = d3.group(graphicData, d => d.series)

  let colour = d3.scaleOrdinal(config.colourPalette); //

  const chartEvery = config.chartEvery[size];

  let margin = config.margin[size]
  let chart_width = (parseInt(graphic.style("width")) / chartEvery) - margin.left - margin.right;
	let height = (config.aspectRatio[size][1] / config.aspectRatio[size][0]) * chart_width


  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width]);

  const y = d3.scaleLinear()
    .range([height, 0])

  let plots = [...new Set(d3.map(graphicData, d => d.series))];

  // both of these are need to be looked at.

  if (config.xDomain == "auto") {
    x.domain([0, d3.max(graphicData, function (d) { return d.xvalue })]);
  } else {
    x.domain(config.xDomain)
  }


  if (config.yDomain == "auto") {
    y.domain([0, d3.max(graphicData, function (d) { return d.yvalue })]);
  } else {
    y.domain(config.yDomain)
  }

  // Create a container div for each small multiple
  let chartContainers = graphic
    .selectAll('.chart-container')
    .data(Array.from(nested_data))
    .join('div')
    .attr('class', 'chart-container');

  function drawChart(container, seriesName, data, chartIndex) {

    svg = addSvg({
      svgParent: container,
      chart_width: chart_width,
      height: height + margin.top + margin.bottom,
      margin: margin
    })

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(config.xAxisTicks[size])
          .tickSize(-height)
          .tickPadding(10)
          .tickFormat(d3.format(config.xAxisFormat))
      )

    svg
      .append('g')
      .attr('class', 'axis numeric')
      .call(
        d3.axisLeft(y)
          .ticks(config.yAxisTicks[size])
          .tickSize(-chart_width)
          .tickPadding(10)
          .tickFormat(d3.format(config.yAxisFormat))
      );

    svg.selectAll('circle')
      .data(data)
      .join('circle')
      // .data(d => d[1])
      .attr('cx', (d) => x(d.xvalue))
      .attr('cy', (d) => y(d.yvalue))
      .attr('r', config.radius)
      .attr("fill", (d) => colour(d.group)) // This adds the colour to the circles based on the group
      .attr('fill-opacity', config.fillOpacity)
      .attr('stroke', (d) => colour(d.group))
      .attr('stroke-opacity', config.strokeOpacity);

    // This does the chart title label
    addChartTitleLabel({
      svgContainer: svg,
      yPosition: -margin.top / 2,
      text: seriesName,
      wrapWidth: chart_width
    })

    // This does the x-axis label - just on the rightmost chart of each row
    addAxisLabel({
      svgContainer: svg,
      xPosition: chart_width,
      yPosition: height + 40,
      text: chartIndex % chartEvery == chartEvery - 1 || chartIndex === plots.length - 1 ?
        config.xAxisLabel : "",
      textAnchor: "end",
      wrapWidth: chart_width
    });

    // This does the y-axis label - just on the leftmost chart of each row
    addAxisLabel({
      svgContainer: svg,
      xPosition: -(margin.left - 5),
      yPosition: -10,
      text: (d) => chartIndex % chartEvery == 0 ? config.yAxisLabel : "",
      textAnchor: "start",
      wrapWidth: chart_width
    });
  }
  // lets move on to setting up the legend for this chart. 
  let legendGroups = [...new Set(graphicData.map(item => item.group))]; // this will extract the unique groups from the data.csv


  let legenditem = legend
    .selectAll('div.legend-item')
    .data(legendGroups)
    .enter()
    .append('div')
    .attr('class', 'legend--item');

  // Hey fellow Brit - I know you might be looking at color and are tempted to change that to colour - don't! Sadly this is a d3 module. https://github.com/d3/d3-color
  legenditem
    .append('div')
    .attr('class', 'legend--icon--circle2')
    .style('background-color', (d) => {
      let color = d3.color(colour(d));
      color.opacity = 0.5;
      return color;
    })
    .style('border-color', (d) => colour(d));

  legenditem
    .append('div')
    .append('p')
    .attr('class', 'legend--text')
    .html((d) => d);


  // Draw the charts for each small multiple
  chartContainers.each(function ([key, value], i) {
    drawChart(d3.select(this), key, value, i);
  });

  //create link to source
  addSource('source', config.sourceText)



  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}


d3.csv(config.graphicDataURL)
  .then(data => {
    //load chart data
    graphicData = data

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
