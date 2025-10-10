import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, svg, xDomain;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.margin[size]
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;

  let groups = d3.groups(graphic_data, (d) => d.group)

  if (config.xDomain == "auto") {
    let min = 0
    let max = 0
    for (let i = 2; i < graphic_data.columns.length; i++) {
      min = d3.min([min, d3.min(graphic_data, (d) => +d[graphic_data.columns[i]])])
      max = d3.max([max, d3.max(graphic_data, (d) => +d[graphic_data.columns[i]])])
    }
    xDomain = [min, max]
  } else {
    xDomain = config.xDomain
  }

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width])
    .domain(xDomain);

  const colour = d3.scaleOrdinal()
    .range(config.colourPalette)
    .domain(Object.keys(config.legendLabels))

  // create the y scale in groups
  groups.map(function (d) {
    //height
    d[2] = config.seriesHeight[size] * d[1].length

    // y scale
    d[3] = d3.scaleBand()
      .paddingOuter(0.2)
      .paddingInner((graphic_data.length - 1) * 10 / (graphic_data.length * 30))
      .range([0, d[2]])
      .domain(d[1].map(d => d.name));
    //y axis generator
    d[4] = d3.axisLeft(d[3])
      .tickSize(0)
      .tickPadding(10);
  });

  //set up xAxis generator
  let xAxis = d3.axisBottom(x)
    .ticks(config.xAxisTicks[size])
    .tickFormat(d3.format(config.xAxisFormat));

  let divs = graphic.selectAll('div.categoryLabels')
    .data(groups)
    .join('div')


  if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

  //remove blank headings
  divs.selectAll('p').filter((d) => (d[0] == "")).remove()

  let charts = addSvg({
    svgParent: divs,
    chart_width: chart_width,
    height: (d) => d[2] + margin.top + margin.bottom,
    margin: margin
  })

  charts.each(function (d) {
    d3.select(this)
      .append('g')
      .attr('class', 'y axis')
      .call(d[4])
      .selectAll('text')
      .call(wrap, margin.left - 10)

    d3.select(this)
      .append('g')
      .attr('transform', (d) => 'translate(0,' + d[2] + ')')
      .attr('class', 'x axis')
      .each(function () {
        d3.select(this).call(xAxis.tickSize(-d[2]))
          .selectAll('line').each(function (e) {
            if (e == 0) {
              d3.select(this)
                .attr('class', 'zero-line')
            };
          })
      })

  })



  charts.selectAll('rect')
    .data((d) => d[1])
    .join('rect')
    .attr('x', d => d.value < 0 ? x(d.value) : x(0))
    .attr('y', d => groups.filter(f => f[0] == d.group)[0][3](d.name))
    .attr('width', (d) => Math.abs(x(d.value) - x(0)))
    .attr('height', (d) => groups.filter(f => f[0] == d.group)[0][3].bandwidth())
    .attr('fill', config.colourPalette);

  let labelPositionFactor = 7;

  if (config.dataLabels.show == true) {
    charts.selectAll('text.value')
      .data((d) => d[1])
      .join('text')
      .attr('class', 'dataLabels')
      .attr('x', (d) => d.value > 0 ? x(d.value) :
        Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? x(0) : x(d.value))
      .attr('dx', (d) => d.value > 0 ?
        (Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 3 : -3) :
        3)
      .attr('y', (d) => groups.filter(f => f[0] == d.group)[0][3](d.name) + groups.filter(f => f[0] == d.group)[0][3].bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', (d) => d.value > 0 ?
        (Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? 'start' : 'end') :
        "start"
      )
      .attr('fill', (d) =>
        (Math.abs(x(d.value) - x(0)) < chart_width / labelPositionFactor ? '#414042' : '#ffffff')
      )
      .text((d) => d3.format(config.dataLabels.numberFormat)(d.value))
  }//end if for datalabels



  // This does the x-axis label
  charts.each(function (d, i) {

    if (i == groups.length - 1) {
      addAxisLabel({
        svgContainer: d3.select(this),
        xPosition: chart_width,
        yPosition: d[2] + 35,
        text: config.xAxisLabel,
        textAnchor: "end",
        wrapWidth: chart_width
      });
    }
  })




  //create link to source
    addSource('source', config.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.graphic_data_url)
  .then(data => {
    //load chart data
    graphic_data = data

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
