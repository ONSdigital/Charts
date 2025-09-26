import { initialise, wrap, addSvg, addDataLabels, addAxisLabel, setupArrowhead, addSource, addAnnotation, createAnnotationToolbar } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.margin[size]
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
  let height = (config.seriesHeight[size] * graphic_data.length) + (10 * (graphic_data.length - 1)) + 12
  const isMobile = size == "sm";

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width]);

  const y = d3.scaleBand()
    .paddingOuter(0.2)
    .paddingInner((graphic_data.length - 1) * 10 / (graphic_data.length * 30))
    .range([0, height])
    .round(true);


  //use the data to find unique entries in the name column
  y.domain([...new Set(graphic_data.map(d => d.name))]);

  //set up yAxis generator
  let yAxis = d3.axisLeft(y)
    .tickSize(0)
    .tickPadding(10)

  //set up xAxis generator
  let xAxis = d3.axisBottom(x)
    .tickSize(-height)
    .tickFormat(d3.format(".0%"))
    .ticks(config.xAxisTicks[size]);

  //create svg for chart
  svg = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  })


  if (config.xDomain == "auto") {
    x.domain([0, d3.max(graphic_data, function (d) { return d.value })]);
  } else {
    x.domain(config.xDomain)
  }

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'x axis')
    .call(xAxis).selectAll('line').each(function (d) {
      if (d == 0) {
        d3.select(this)
          .attr('class', 'zero-line')
      };
    })


  svg
    .append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text').call(wrap, margin.left - 10)


  svg.selectAll('bars')
    .data(graphic_data)
    .join('rect')
    .attr('x', x(0))
    .attr('y', (d) => y(d.name))
    .attr('width', (d) => x(d.value) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', config.colour_palette);


  if (config.dataLabels.show == true) {

    addDataLabels({
      svgContainer: svg,
      data: graphic_data,
      chart_width: chart_width,
      labelPositionFactor: 7,
      xScaleFunction: x,
      yScaleFunction: y
    })
  }//end if for datalabels

  // This does the x-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: chart_width,
    yPosition: height + 35,
    text: config.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chart_width
  });

  addAnnotation({
    svg: svg,
    type: 'line-vertical',
    x: x(0.2),
    label: 'A vertical line annotation',
    line: { height: height },
    editable:false,
    mobile:{enabled:isMobile,number:1}
  })

  //setup the arrowhead marker
  setupArrowhead(d3.select("svg"));

  addAnnotation({
    svg:svg,
    type:'arrow',
    x:x(0.48),
    y:y("Arts") + y.bandwidth()/2,
    label:"An arrow annotation, also known as a point annotation",
    arrow:{lengthX:50,lengthY:50,offsetX:10,offsetY:10,curve:'left'},
    position:{
      text:'below',
    },
    editable:false,
    mobile:{enabled:isMobile,number:2}

  })

  addAnnotation({
    svg:svg,
    type:'text',
    x:x(0.38),
    y:y("A few more")-5,
    label:"A free text annotation",
    editable:false,   
    mobile:{enabled:isMobile,number:3}

  })

  addAnnotation({
    svg:svg,
    type:'direction-arrow',
    x:x(1),
    y:15,
    label:"A direction arrow, with end anchor",
    arrow:{direction:'right'},
    editable:false,
  })

  addAnnotation({
    svg:svg,
    type:'direction-arrow',
    x:x(0.22),
    y:height-20,
    label:"A direction arrow, with start anchor",
    arrow:{direction:'right'},
    position:{anchor:'start'},
    editable:false,
  })

  addAnnotation({
    svg:svg,
    type:'range-vertical',
    x:x(0.6),
    y:y('Small bars'),
    label:"A vertical range annotation",
    line:{endX:x(0.9),height:height},
    position:{text:"left",enclosure:"inside"},
    editable:false,
    mobile:{enabled:isMobile,number:4}
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
