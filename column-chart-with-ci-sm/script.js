import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let legend = d3.select('#legend');
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

  let colour = d3.scaleOrdinal(config.colourPalette);

  const chartEvery = config.chartEvery[size];


  // let legenditem = d3
  //   .select('#legend')
  //   .selectAll('div.legend-item')
  //   .data(legendGroups)
  //   .enter()
  //   .append('div')
  //   .attr('class', 'legend--item');

  // legenditem
  //   .append('div')
  //   .attr('class', 'legend--icon--circle')
  //   .style('background-color', (d) => colour(d));

  // legenditem
  //   .append('div')
  //   .append('p')
  //   .attr('class', 'legend--text')
  //   .html((d) => d);


  //lets also try a new smallmultiple version here which will group data on the basis of plot
  let grouped_data = d3.group(graphicData, d => d.plot)

  let xDataType;

  if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
    xDataType = 'date';
  } else {
    xDataType = 'numeric';
  }

  // console.log(xDataType)

  // console.log(Array.from(grouped_data))

  // Create a container div for each small multiple
  var chartContainers = graphic
    .selectAll('.chart-container')
    .data(Array.from(grouped_data))
    .join('div')
    .attr('class', 'chart-container');

  function drawChart(container, seriesName, data, chartIndex) {

    let chartsPerRow = chartEvery;
    let chartPosition = chartIndex % chartsPerRow;

    let margin = { ...config.margin[size] };

    let chartGap = config.optional?.chartGap || 10;

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
    let aspectRatio = config.aspectRatio[size];
    let height = (aspectRatio[0]*chart_width/aspectRatio[1] )- margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .paddingOuter(0.0)
      .paddingInner(0.1)
      .range([0, chart_width])
      .round(false);

    //use the data to find unique entries in the date column
    x.domain([...new Set(graphicData.map((d) => d.date))]);

    // console.log("x", d3.extent(graphicData, (d) => +d.date))

    const y = d3.scaleLinear()
      .range([height, 0])

    //create svg for chart
    svg = addSvg({
      svgParent: container,
      chart_width: chart_width,
      height: height + margin.top + margin.bottom,
      margin: margin
    })

    // console.log(grouped_data)

    // both of these are need to be looked at.
    if (config.yDomain == "auto") {
      if (d3.min(graphicData.map(({ lowerCI }) => Number(lowerCI))) >= 0) {
        y.domain([
          0,
          d3.max(graphicData.map(({ upperCI }) => Number(upperCI)))]); //modified so it converts string to number
      } else {
        y.domain([d3.min(graphicData, function (d) { return d.lowerCI }), d3.max(graphicData, function (d) { return d.upperCI })])
      }

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
            : d3.format(config.xAxisNumberFormat)(d)))

    svg.selectAll('g.x.axis')
      .selectAll('text')
      .call(wrap, x.bandwidth());


    //Add the y-axis to the leftmost chart, or all charts if dropYAxis in the config is false
    svg
      .append('g')
      .attr('class', 'axis numeric')
      .call(
        d3.axisLeft(y)
          .ticks(config.yAxisTicks[size])
          .tickSize(-chart_width)
          .tickPadding(10)
          .tickFormat((d) => config.dropYAxis !== true ? d3.format(config.yAxisTickFormat)(d) :
            chartPosition == 0 ? d3.format(config.yAxisTickFormat)(d) : "")
      );



    //add columns to the plot
    svg.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.date))
      .attr('y', (d) => y(Math.max(d.yvalue, 0)))
      .attr('height', (d) => Math.abs(y(d.yvalue) - y(0)))
      .attr('width', x.bandwidth())
      // .attr('r', config.radius)
      .attr("fill", (d) => colour(d.group)) // This adds the colour to the circles based on the group
      .attr('fill-opacity', config.fillOpacity)
      .attr('stroke', (d) => colour(d.group))
      .attr('stroke-opacity', config.strokeOpacity);


    //adding ci's to each of the charts.
    svg.append('g')
      .selectAll('line')
      .data((d) => d[1])
      .join('line')
      .attr('class', 'CI')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2)
      .attr('y1', d => y(d.lowerCI))
      .attr('x2', d => x(d.date) + x.bandwidth() / 2)
      .attr('y2', d => y(d.upperCI))
      .attr("stroke", '#222')
      .attr('stroke-width', '2px')


    let capWidth = 10;

    svg.append('g')
      .selectAll('line.lower')
      .data((d) => d[1])
      .join('line')
      .attr('class', 'lower CI')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2 - capWidth / 2)
      .attr('y1', d => y(d.lowerCI))
      .attr('x2', d => x(d.date) + x.bandwidth() / 2 + capWidth / 2)
      .attr('y2', d => y(d.lowerCI))
      .attr("stroke", '#222')
      .attr('stroke-width', '2px')


    svg.append('g')
      .selectAll('line.upper')
      .data((d) => d[1])
      .join('line')
      .attr('class', 'upper CI')
      .attr('x1', d => x(d.date) + x.bandwidth() / 2 - capWidth / 2)
      .attr('y1', d => y(d.upperCI))
      .attr('x2', d => x(d.date) + x.bandwidth() / 2 + capWidth / 2)
      .attr('y2', d => y(d.upperCI))
      .attr("stroke", '#222')
      .attr('stroke-width', '2px')


    // This does the chart title label
    addChartTitleLabel({
      svgContainer: svg,
      yPosition: -margin.top / 2,
      text: seriesName,
      wrapWidth: chart_width
    })

    // This does the x-axis label
    addAxisLabel({
      svgContainer: svg,
      xPosition: chart_width,
      yPosition: height + margin.bottom,
      text: chartIndex % chartEvery == chartEvery - 1 ?
        config.xAxisLabel : "",
      textAnchor: "end",
      wrapWidth: chart_width
    });

    // This does the y-axis label
    addAxisLabel({
      svgContainer: svg,
      xPosition: 5 - margin.left,
      yPosition: -10,
      text: chartPosition == 0 ? config.yAxisLabel : "",
      textAnchor: "start",
      wrapWidth: chart_width
    });



  }// End drawChart



  // Draw the charts for each small multiple
  chartContainers.each(function ([key, value], i) {
    drawChart(d3.select(this), key, value, i);
  });



  //create link to source
  addSource('source', config.sourceText);


  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

//load data 
d3.csv(config.graphicDataURL)
  .then((data) => {

    let parseTime = d3.timeParse(config.dateFormat);
    //load chart data
    graphicData = data;

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
