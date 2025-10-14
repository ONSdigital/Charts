import { initialise, wrap, addSvg, addDataLabels, addAxisLabel, setupArrowhead, addAnnotationArrow, addDirectionArrow, addAnnotationLineVertical, addAnnotationRangeVertical, addAnnotationText, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);
  
  let margin = config.margin[size]
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
  let height = (config.seriesHeight[size] * graphicData.length) + (10 * (graphicData.length - 1)) + 12

  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width]);

  const y = d3.scaleBand()
    .paddingOuter(0.2)
    .paddingInner((graphicData.length - 1) * 10 / (graphicData.length * 30))
    .range([0, height])
    .round(true);


  //use the data to find unique entries in the name column
  y.domain([...new Set(graphicData.map(d => d.name))]);

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
    x.domain([0, d3.max(graphicData, function (d) { return d.value })]);
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
    .data(graphicData)
    .join('rect')
    .attr('x', x(0))
    .attr('y', (d) => y(d.name))
    .attr('width', (d) => x(d.value) - x(0))
    .attr('height', y.bandwidth())
    .attr('fill', config.colourPalette);


  if (config.dataLabels.show == true) {

    addDataLabels({
			svgContainer: svg,
			data: graphicData,
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




  //adds vertical annotation line and text
  addAnnotationLineVertical(

    //name of the svg you're adding to 
    svg,

    // chart height. Will normally be height
    height,

    //x postion
    x(0.20),

    // text
    'A vertical annotation line',

    //text position ('left' or 'right' of the line)
    'right',

    //y positon of text
    20,

    //wrap width
    150,
  
    //turn on mobile alternative annotations
    true,

    //number of the annotation (will be the number in the circle and the coresponding footnote.) Note: we are looking at a way to automate this. 
    1,

    //adjusts the position of the mobile circle (x,y)
    0, 0,
 
    //Move the line to the back (default should be false)
    false,
   //leave as 'size' - you shouldn't have to change this. It's a condition to ensure that the 'size' variable is brought back into the helper function
   size

  )
  //   ;



  //setup the arrowhead marker
  // ("svg") is the reference for the object you are appending to. In most of our templates it will be svg 
  setupArrowhead(d3.select("svg"));


  // adds annoation arrow and text 
  // note - you need to add the setupArrowhead line above
  addAnnotationArrow(

    //name of the svg you're adding to 
    svg,

    //x and y values of your data point

    x(0.48),

    y("Arts") + y.bandwidth() / 2,

    //offset from your data point to arrowhead (x and y values)
    10, 10,

    //arrow length x and y
    50, 50,

    //curve direction (choose 'left' or 'right'). If blank the default is left
    "left",

    //annotation text
    "An arrow annotation, also known as a point annotation",

    //annotation text position - 'above', 'left', 'below' or 'right' 
    //this determines the position and alignment of the text relative to the arrow
    "below",

    //wrap width
    x(1) - x(0.5),


    //turn on mobile alternative annotations
    true,

    //number of the annotation (will be the number in the circle and the coresponding footnote.) Note: we are looking at a way to automate this. 
    2,

    //adjusts the position of the mobile circle (x,y)
    14, 0,


    //leave as 'size' - you shouldn't have to change this. It's a condition to ensure that the 'size' variable is brought back into the helper function
    size


    
  );

// text with no arrow, but with mobile alternative
  addAnnotationText(
    //name of the svg
    svg, 

    //x and y position
    x(0.38),y('A few more')-5,

    //text position adjustment x and y  
    0,0,
    
    //your text here
    'A free text annotation',
    
    //text anchor, start or end (should normally be 'start' i.e. left aligned)
    'start',
    
    //wrap size
    150,
    
    //mobile alternative on and off
    true,
    // the number in the circle on mobile
    3,
    
  //adjust the circle position - x and y
    0,0,
    
    
    //size (should always be size)
    size)


  // adds vertical annotation range and text
  //// n.b. adds band like the other annotations after plotting your chart (the rectangle is moved below the chart, while text remains on top)

  addAnnotationRangeVertical(
    //name of the svg you're adding to 
    svg,

    // chart height. Will normally be height
    height,

    //band start value
    x(0.6),

    //band end value
    x(1),

    // text
    'A vertical annotation range',

    //text position relative to the band (choose 'left' or 'right')
    'left',

    //text position inside or outside band (chose 'inside' or 'outside' )
    'inside',

    //y positon of text
    height - 20,

    //wrap width

    x(1) - x(0.6),

    //turn on mobile alternative annotations
    true,

    //number of the annotation (will be the number in the circle and the coresponding footnote.) Note: we are looking at a way to automate this. 
    4,

    //adjusts the position of the mobile circle (x,y)
    10, -30,


    //leave as 'size' - you shouldn't have to change this. It's a condition to ensure that the 'size' variable is brought back into the helper function
    size


  )


  //adds direction arrow
  addDirectionArrow(
    //name of your svg, normally just SVG
    svg,
    //direction of arrow: left, right, up or down
    'right',

    //anchor end or start (end points the arrow towards your x value, start points away)
    'end',

    //x value
    x(1),

    //y value
    10,

    //alignment - left or right for vertical arrows, above or below for horizontal arrows
    'right',

    //annotation text
    "A direction arrow, with end anchor",

    //wrap width
    x(0.5),

    //text adjust y
    0,

    //Text vertical align: top, middle or bottom (default is middle)
    'bottom',
    //

    // you can also optionally add a colour here to make the arrow (but not text) a different colour
  )


  //adds direction arrow
  addDirectionArrow(
    //name of your svg, normally just SVG
    svg,
    //direction of arrow: left, right, up or down
    'right',

    //anchor end or start (end points the arrow towards your x value, start points away)
    'start',

    //x value
    x(0.2),

    //y value
    height - 15,

    //alignment - left or right for vertical arrows, above or below for horizontal arrows
    'right',

    //annotation text
    "A direction anchor",

    //wrap width
    200,

    //text adjust y (probably not needed but if you need to adjust the vertical position of the text if it's not looking aligned)
    0,

    //Text vertical align: top, middle or bottom (default is middle)
    'middle',
    //

    // you can also optionally add a colour here to make the arrow a different colour. This won't change the text colour
  )

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
