import { initialise, wrap2, addSvg, addAxisLabel, diamondShape, createDelaunayOverlay, addSource } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

const circleSize = 105; // Define size for circles in pixels
const squareSize = 90; // Define size for squares in pixels
const triangleSize = 75; // Define size for triangles in pixels
const diamondSize = 95; // Define size for diamonds in pixels

// Add this variable to store the overlay cleanup function
let overlayCleanup = null;

function drawGraphic() {
  // add cleanup when the chart is destroyed/redrawn
  function cleanupPreviousChart() {
    if (overlayCleanup) {
      overlayCleanup();
      overlayCleanup = null;
    }
  }
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let colour = d3.scaleOrdinal(config.colourPalette);

  let margin = config.margin[size];
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  let height = (config.aspectRatio[size][1] / config.aspectRatio[size][0]) * chart_width;

  const x = d3.scaleLinear().range([0, chart_width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Create size scale for circles
  let sizeScale = null;
  if (config.sizeConfig.enabled && graphic_data.some(d => d[config.sizeConfig.sizeField] !== undefined)) {
    const sizeExtent = d3.extent(graphic_data, d => +d[config.sizeConfig.sizeField]);
    sizeScale = d3.scaleSqrt()
      .domain(sizeExtent)
      .range([config.sizeConfig.minSize, config.sizeConfig.maxSize]);
  }

  svg = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  });

  let groups = [...new Set(graphic_data.map(item => item.group))].sort();

  let shape = d3.scaleOrdinal()
    .domain(groups)
    .range(['circle', 'square', 'triangle', 'diamond']);

  // Add size legend if size scaling is enabled
  if (sizeScale) {
    const sizeLegend = legend.append('div')
      .attr('class', 'size-legend')
      .style('margin-top', '20px');

    sizeLegend.append('h4')
      .text('Size Scale')
      .style('margin', '0 0 10px 0')
      .style('font-size', '14px')
      .style('font-weight', '600');

    const sizeExtent = sizeScale.domain();
    const sizeLegendData = [sizeExtent[0], sizeExtent[1]];

    const sizeLegendItems = sizeLegend.selectAll('div.size-legend-item')
      .data(sizeLegendData)
      .enter()
      .append('div')
      .attr('class', 'size-legend-item')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('margin-bottom', '5px');

    sizeLegendItems.append('svg')
      .attr('width', 30)
      .attr('height', d => Math.round(Math.sqrt(sizeScale(d) / Math.PI)*2))
      .append('circle')
      .attr('cx', 15)
      .attr('cy', d => Math.round(Math.sqrt(sizeScale(d) / Math.PI)))
      .attr('r', d => Math.sqrt(sizeScale(d) / Math.PI))
      .attr('fill', config.colourPalette[0])
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    sizeLegendItems.append('span')
      .style('margin-left', '5px')
      .style('font-size', '12px')
      .text(d => d3.format(config.sizeLabelFormat)(d));
  }else{
    

  let legenditem = legend.selectAll('div.legend-item')
    .data(groups)
    .enter()
    .append('div')
    .attr('class', 'legend--item')
    .style('display', 'flex')
    .style('align-items', 'center');

  legenditem.append('svg')
    .attr('width', 20)
    .attr('height', 20)
    .append('path')
    .attr('stroke-width', '1px')
    .attr('d', d => {
      switch (shape(d)) {
        case 'circle': return d3.symbol().type(d3.symbolCircle).size(circleSize)();
        case 'square': return d3.symbol().type(d3.symbolSquare).size(squareSize)();
        case 'triangle': return d3.symbol().type(d3.symbolTriangle).size(triangleSize)();
        case 'diamond': return diamondShape(diamondSize / 10); // Use the custom diamond shape
      }
    })
    .attr('transform', 'translate(10,10)')
    .attr('fill', d => colour(d))
    .attr('stroke', '#fff');

  legenditem.append('p')
    .attr('class', 'legend--text')
    .style('margin-left', '5px')
    .text(d => d);
  }

  // set up dropdown
  const dropdownData = graphic_data
  .slice() // Create copy to avoid mutating original
  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  .map((point) => ({
    id: point.originalId,  // Use stable ID
    label: point.name || `Point ${point.originalId + 1}`,
    group: point.group
  }));

  const select = new EnhancedSelect({
    containerId: 'select',
    options: dropdownData,
    label: 'Choose a point',
    placeholder: "Select a data point",
    mode: 'default',
    idKey: 'id',
    labelKey: 'label',
    groupKey: 'group',
    onChange: (selectedValue) => {
      if (selectedValue) {
        const renderIndex = graphic_data.findIndex(d => d.originalId === selectedValue.id);
        overlayCleanup.highlightPoint(renderIndex);
      } else {
        overlayCleanup.clearHighlight();
      }
    }
  });



  if (config.xDomain == "auto") {
    x.domain([d3.min(graphic_data, d => d.xvalue), d3.max(graphic_data, d => d.xvalue)]);
  } else {
    x.domain(config.xDomain);
  }


  if (config.yDomain == "auto") {
    y.domain([d3.min(graphic_data, d => d.yvalue), d3.max(graphic_data, d => d.yvalue)]);
  } else {
    y.domain(config.yDomain);
  }

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .ticks(config.xAxisTicks[size])
      .tickSize(-height)
      .tickPadding(10)
      .tickFormat(d3.format(config.xAxisFormat))
    )
    .selectAll('line')
    .each(function (d) {
      if (d === 0) {
        d3.select(this).attr('class', 'zero-line');
      }
    });


  svg
    .append('g')
    .attr('class', 'axis numeric')
    .call(
      d3.axisLeft(y)
        .ticks(config.yAxisTicks[size])
        .tickSize(-chart_width)
        .tickPadding(10)
        .tickFormat(d3.format(config.yAxisFormat))
    ).selectAll('line')
    .each(function (d) {
      if (d === 0) {
        d3.select(this).attr('class', 'zero-line');
      }
    });

  // Function to get symbol size based on data point
  function getSymbolSize(d) {
    if (shape(d.group) === 'circle' && sizeScale && d[config.sizeConfig.sizeField] !== undefined) {
      return sizeScale(+d[config.sizeConfig.sizeField]);
    }
    // Return default sizes for other shapes or when size scaling is disabled
    switch (shape(d.group)) {
      case 'circle': return circleSize;
      case 'square': return squareSize;
      case 'triangle': return triangleSize;
      case 'diamond': return diamondSize;
      default: return circleSize;
    }
  }

  svg.append('g').selectAll('path')
    .data(graphic_data.sort((a, b) => { 
      if (sizeScale) { 
        return d3.descending(a[config.sizeConfig.sizeField],b[config.sizeConfig.sizeField])
      } else {
        return 0
      }
    }))
    .join('path')
    .attr('d', d => {
      const symbolSize = getSymbolSize(d);

      switch (shape(d.group)) {
        case 'circle': return d3.symbol().type(d3.symbolCircle).size(symbolSize)();
        case 'square': return d3.symbol().type(d3.symbolSquare).size(symbolSize)();
        case 'triangle': return d3.symbol().type(d3.symbolTriangle).size(symbolSize)();
        case 'diamond': return diamondShape(symbolSize / 10); // Use the custom diamond shape
      }
    })
    .attr('transform', d => `translate(${x(d.xvalue)},${y(d.yvalue)})`)
    .attr('fill', d => colour(d.group))
    .attr('fill-opacity', config.fillOpacity)
    .attr('stroke', d => d.highlight === 'y' ? '#222' : config.sizeConfig.enabled ? ONScolours.oceanBlue : "#fff")
    .attr('stroke-width', d => d.highlight === 'y' ? '1.5px' : '1px')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-opacity', config.strokeOpacity);

  // Clean up previous overlay if it exists
  if (overlayCleanup) {
    overlayCleanup();
  }

  // Create Delaunay overlay for tooltips (Basic version)
  overlayCleanup = createDelaunayOverlay({
    svgContainer: svg,
    data: graphic_data.sort((a, b) => { 
      if (sizeScale) { 
        return d3.descending(a[config.sizeConfig.sizeField],b[config.sizeConfig.sizeField])
      } else {
        return 0
      }
    }),
    chart_width: chart_width,
    height: height,
    xScale: x,
    yScale: y,
    shape: shape,
    sizeScale: sizeScale,
    sizeField: config.sizeConfig.sizeField,
    getSymbolSize: getSymbolSize,
    tooltipConfig: {
      xValueFormat: d3.format(config.xAxisFormat),
      yValueFormat: d3.format(config.yAxisFormat),
      sizeValueFormat: d3.format(config.sizeLabelFormat),
      xLabel: config.xAxisLabel || 'X Value',
      yLabel: config.yAxisLabel || 'Y Value',
      sizeLabel: config.sizeLabel || 'Size',
      groupLabel: config.groupLabel || 'Group',
      width: "250px",
      offset: { x: 3, y: 3 }
    },
    margin: margin
  });

  svg.selectAll('text.label')
    .data(graphic_data.filter(d => d.highlight === 'y'))
    .join('text')
    .attr('class', 'dataLabels')
    .attr('x', d => x(d.xvalue))
    .attr('y', d => y(d.yvalue))
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('fill', '#404142')
    .text(d => d.name)
    .style('font-weight', '600')
    .each(function(d){
      if(sizeScale){
        wrap2(d3.select(this),100,Math.round(Math.sqrt(sizeScale(d[config.sizeConfig.sizeField]) / Math.PI))/14+1,1,1.05,1,true,'middle')
      } else {
        wrap2(d3.select(this),100,1.5,1,1.05,1,true,'middle')
      }
    });

  // This does the x-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: chart_width,
    yPosition: height + 40,
    text: config.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chart_width
  });

  // This does the y-axis label
  addAxisLabel({
    svgContainer: svg,
    xPosition: -(margin.left - 5),
    yPosition: -10,
    text: config.yAxisLabel,
    textAnchor: "start",
    wrapWidth: chart_width
  });


  //create link to source

  addSource('source', config.sourceText)



  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}


d3.csv(config.graphic_data_url,d3.autoType)
  .then(data => {
    // Add unique IDs based on original data order
    graphic_data = data.map((d, index) => ({
      ...d,
      originalId: index  // Add stable unique ID
    }));

    // Sort for rendering (largest circles first)
    if (config.sizeConfig.enabled) {
      graphic_data.sort((a, b) => (+b[config.sizeConfig.sizeField]) - (+a[config.sizeConfig.sizeField]));
    }

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
