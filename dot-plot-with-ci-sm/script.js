import { initialise, wrap, addSvg, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg, nested_data;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  //group data on the basis of plot
  nested_data = d3.group(graphic_data, d => d.series)

  let plots = [...new Set(graphic_data.map(d => d.series))];

  let colour = d3.scaleOrdinal(config.colourPalette);

  const chartEvery = config.chartEvery[size];

  let margin = config.margin[size]
  let aspectRatio = config.aspectRatio[size];
  let chart_width = (parseInt(graphic.style("width")) / chartEvery) - margin.left - margin.right;
	let height = (aspectRatio[1] / aspectRatio[0]) * chart_width;

  let xDataType;

  if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
    xDataType = 'date';
  } else {
    xDataType = 'numeric';
  }

  // console.log(xDataType)

  //set up scales

  let x;

  if (xDataType == 'date') {
    x = d3.scaleTime()
      .domain(d3.extent(graphic_data, (d) => d.date))
      .range([0, chart_width]);
  } else {
    x = d3.scaleLinear()
      .domain(d3.extent(graphic_data, (d) => +d.date))
      .range([0, chart_width]);
  }


  // console.log("x",d3.extent(graphic_data, (d) => +d.date))

  const y = d3.scaleLinear()
    .range([height, 0])

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

    // both of these are need to be looked at.

    if (config.yDomain == "auto") {
      y.domain([0, d3.max(graphic_data, function (d) { return d.upperCI })]);
    } else {
      y.domain(config.yDomain)
    }

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(config.xAxisTicks[size])
          .tickSize(-height)
          .tickPadding(10)
          .tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.xAxisFormat)(d)
            : d3.format(config.xAxisNumberFormat)(d)));


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


    //adding ci's to each of the charts.

    svg.append('g')
      .selectAll('line')
      .data(data)
      .join('line')
      .attr('x1', d => x(d.date))
      .attr('y1', d => y(d.lowerCI))
      .attr('x2', d => x(d.date))
      .attr('y2', d => y(d.upperCI))
      .attr("stroke", d => colour(d.group))
      .attr('stroke-opacity')

    let capWidth = 10;

    svg.append('g')
      .selectAll('line.lower')
      .data(data)
      .join('line')
      .attr('class', 'lower')
      .attr('x1', d => x(d.date) - capWidth / 2)
      .attr('y1', d => y(d.lowerCI))
      .attr('x2', d => x(d.date) + capWidth / 2)
      .attr('y2', d => y(d.lowerCI))
      .attr("stroke", d => colour(d.group))

    svg.append('g')
      .selectAll('line.upper')
      .data(data)
      .join('line')
      .attr('class', 'upper')
      .attr('x1', d => x(d.date) - capWidth / 2)
      .attr('y1', d => y(d.upperCI))
      .attr('x2', d => x(d.date) + capWidth / 2)
      .attr('y2', d => y(d.upperCI))
      .attr("stroke", d => colour(d.group))


    //add dots to the plot
    svg.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.date))
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
  let legendGroups = [...new Set(graphic_data.map(item => item.group))]; // this will extract the unique groups from the data.csv


  let legenditem = d3
    .select('#legend')
    .selectAll('div.legend-item')
    .data(legendGroups)
    .enter()
    .append('div')
    .attr('class', 'legend--item');

  legenditem
    .append('div')
    .attr('class', 'legend--icon--circle')
    .style('background-color', (d) => colour(d));

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

//load data 
d3.csv(config.graphic_data_url)
  .then((data) => {

    let parseTime = d3.timeParse(config.dateFormat);
    //load chart data
    graphic_data = data;

    data.forEach((d, i) => {

      //If the date column is has date data store it as dates
      if (parseTime(data[i].date) !== null) {
        d.date = parseTime(d.date)
      }
      // console.log(data[i].date)
    });

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
