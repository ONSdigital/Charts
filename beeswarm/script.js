import { initialise, addSvg, addAxisLabel, createDelaunayOverlay } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, xDomain, circleDist, radius;

function positionCircles(data, x, y, radius, layoutMethod = "binned", circleDist) {
  if (layoutMethod === "force") {
    return positionCirclesWithForce(data, x, y, radius);
    
  } else {
    return positionCirclesWithBinning(data, x, y, radius, circleDist);
  }
}

function positionCirclesWithBinning(data, x, y, radius, circleDist) {
  // Calculate the binned values
  const minValue = d3.min(data, d => d.value);
  const maxValue = d3.max(data, d => d.value);
  const binSize = (maxValue - minValue) / config.essential.numBands;

  // Create bins and assign vertical positions
  const bins = {};
  data.forEach(d => {
    const binNumber = Math.floor((d.value - minValue) / binSize);
    d.valueRound = minValue + (binNumber * binSize)// + (binSize / 2);

    // Create unique key for this group and bin combination
    const binKey = d.group + '_' + d.valueRound;

    // Assign vertical position
    if (binKey in bins) {
      d.y = bins[binKey]++;
    } else {
      d.y = 0;
      bins[binKey] = 1;
    }
    // Calculate final position
    d.x = x(d.valueRound);
    d.y = y(d.group) + y.bandwidth() - radius / 2 - circleDist * d.y * 2; // I don't know why it's x2 but it is
  });
  return data;
}

function positionCirclesWithForce(data, x, y, radius) {
  const forceConfig = config.essential.forceOptions;

  // Initialize positions
  data.forEach(d => {
    d.x = x(d.value);
    d.y = y(d.group) + y.bandwidth() / 2;
    d.targetX = x(d.value); // Store target x position
    d.targetY = y(d.group) + y.bandwidth() / 2; // Store target y position
  });


  // Group data by group for separate simulations
  const groupedData = d3.groups(data, d => d.group);

  groupedData.forEach(([groupName, groupData]) => {
    const groupY = y(groupName);
    const groupHeight = y.bandwidth();

    // Create force simulation for this group
    const simulation = d3.forceSimulation(groupData)
      .alphaMin(forceConfig.alphaMin || 0.001)
      .velocityDecay(forceConfig.velocityDecay || 0.2)
      .force("x", d3.forceX(d => d.targetX).strength(forceConfig.centerStrength || 0.1))
      .force("y", d3.forceY(d => d.targetY).strength(forceConfig.centerStrength || 0.1))
      .force("collide", d3.forceCollide()
        .radius(radius*0.6) // Slightly smaller than visual radius for tighter packing
        .strength(forceConfig.strength || 0.5)
      )
      // .force('manybody',d3.forceManyBody().strength(-50))
      .force("boundary", boundaryForce(groupY, groupY + groupHeight,radius));

    // Run simulation for specified iterations
    for (let i = 0; i < (forceConfig.iterations || 120); ++i) {
      simulation.tick();
    }

    simulation.stop();
  });

  return data;
}

// Custom force to keep circles within group boundaries
function boundaryForce(minY, maxY, radius) {
  let nodes;

  function force() {
    for (let i = 0, n = nodes.length; i < n; ++i) {
      const node = nodes[i];
      const radiusOffset = radius;
      
      // Gradually nudge the node back into the boundary
      if (node.y < minY + radiusOffset) {
        node.vy += (minY + radiusOffset - node.y) * 0.1;
      }
      if (node.y > maxY - radiusOffset) {
        node.vy += (maxY - radiusOffset - node.y) * 0.1;
      }
    }
  }

  force.initialize = function(_) {
    nodes = _;
  };

  return force;
}

function drawGraphic() {

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.optional.margin[size]
  let groups = d3.groups(graphic_data, (d) => d.group)
  let chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
  let height = config.optional.seriesHeight[size] * groups.length

  // Set up the legend
  const legenditem = d3
    .select('#legend')
    .selectAll('div.legend--item')
    .data([["Country average", config.essential.averages.colour]])
    .enter()
    .append('div')
    .attr('class', 'legend--item');

  legenditem
    .append('div')
    .attr('class', 'legend--icon--refline')
    .style('background-color', function (d) {
      return d[1];
    });

  legenditem
    .append('div')
    .append('p')
    .attr('class', 'legend--text')
    .html(function (d) {
      return d[0];
    });

    // set up dropdown
  const dropdownData = graphic_data.sort((a,b)=>a.areanm.localeCompare(b.areanm)).map((point, index) => ({
    id: index,
    label: point.areanm || `Point ${index + 1}`,
    group: point.group
  }));

  const select = new EnhancedSelect({
    containerId: 'select',
    options: dropdownData,
    label: 'Choose a point',
    placeholder:"Select a data point",
    mode: 'default',
    idKey: 'id',
    labelKey: 'label',
    groupKey:'group',
    onChange: (selectedValue) => {
      if (selectedValue) {
        overlay.highlightPoint(selectedValue.id);
      } else {
        overlay.clearHighlight();
      }
    }
  });

  const min = d3.min(graphic_data, (d) => +d["value"])
  const max = d3.max(graphic_data, (d) => +d["value"])

  if (config.essential.xDomain == "auto") {
    xDomain = [min, max]
  } else {
    xDomain = config.essential.xDomain
  }


  //set up scales
  const x = d3.scaleLinear()
    .range([0, chart_width])
    .domain(xDomain);

  const y = d3.scaleBand()
    .domain(groups.map(d => d[0]))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.07)

  //set up xAxis generator
  let xAxis = d3.axisBottom(x)
    .ticks(config.optional.xAxisTicks[size])
    .tickSize(-height+margin.top)
    .tickFormat(d3.format(config.essential.xAxisFormat));

  if (config.essential.radius == "auto") {
    radius = (x(x.domain()[1]) - x(x.domain()[0])) / (config.essential.numBands * 1.1);
  } else {
    radius = config.essential.radius
  }

  if (config.essential.circleDist == "auto") {
    circleDist = (y.bandwidth() * 0.95 - radius) / d3.max(graphic_data, d => d.value);
  } else {
    circleDist = config.essential.circleDist * radius
  }


  let chart = addSvg({
    svgParent: graphic,
    chart_width: chart_width,
    height: height + margin.top + margin.bottom,
    margin: margin
  })

    // x axis
  chart.append("g")
    .attr('transform', (d) => 'translate(0,' + (height - margin.top - margin.bottom) + ')')
    .attr('class', 'x axis')
    .call(xAxis);

  chart
    .append("g")
    .attr("fill", "#d7d7d7")
    .attr("opacity",0.25)
    .selectAll("rect")
    .data(y.domain())
    .join("rect")
    .attr("x", 0)
    .attr("y", d => y(d))
    .attr("width", () => x(x.domain()[1]) - x(x.domain()[0]))
    .attr("height", y.bandwidth);

  // group labels
  if (groups.length > 1) {
    chart
      .append("g")
      .attr("fill", "#444")
      .selectAll("text")
      .data(y.domain())
      .join("text")
      .attr("x", 5)
      .attr("y", d => y(d) + 17)
      .text(d => d);
  }

  // x axis
  chart.append("g")
    .attr('transform', (d) => 'translate(0,' + (height - margin.top - margin.bottom) + ')')
    .attr('class', 'x axis')
    .call(xAxis);

    // Position circles based on selected method
  const positionedData = positionCircles(
    [...graphic_data],
    x,
    y,
    radius,
    config.essential.layoutMethod || "binned",
    circleDist
  );

  // Draw circles with positioned data
  chart.append("g")
    .attr("fill", config.essential.colour_palette)
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .selectAll("circle")
    .data(positionedData.reverse())
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", radius / 2)
    .append("title")
    .text(d => d.areanm + ' ' + d.value);

  // Add Delaunay overlay
  const overlay = createDelaunayOverlay({
    svgContainer: chart,
    data: positionedData.map(d => ({
      xvalue: d.x,
      yvalue: d.y,
      name: d.areanm,
      group: d.group,
      value: d.value,
      formattedValue: d3.format(".1f")(d.value)
    })).sort((a,b)=>a.name.localeCompare(b.name)),
    chart_width: chart_width,
    height: height - margin.top - margin.bottom,
    xScale: (d)=>d,
    yScale: d3.scaleLinear().domain([0, height - margin.top - margin.bottom]).range([0, height - margin.top - margin.bottom]),
    tooltipConfig: {
      xLabel: config.essential.xAxisLabel || 'Value',
      xValueFormat: d3.format(".1f"),
      showYValue: false,
      backgroundColor:"#fff"
    },
    shape: () => 'circle',
    circleSize: Math.PI * (radius / 2) * (radius / 2),
    radius: 25,
    margin: margin
  });

  // Add average lines if they're defined in config
  if (config.essential.averages && config.essential.averages.show) {
    // Create average lines
    chart.append("g")
      .attr("class", "average-lines")
      .selectAll("line")
      .data(config.essential.averages.values)
      .join("line")
      .attr("x1", d => x(d.value))
      .attr("x2", d => x(d.value))
      .attr("y1", d => y(d.group))
      .attr("y2", d => y(d.group) + y.bandwidth())
      .attr("stroke", config.essential.averages.colour || "#444")
      .attr("stroke-width", config.essential.averages.strokeWidth || 2)
      .attr("stroke-dasharray", config.essential.averages.strokeDash || "");

    // Add average labels if enabled
    if (config.essential.averages.showLabels) {
      chart.append("g")
        .attr("class", "average-labels")
        .selectAll("text")
        .data(config.essential.averages.values)
        .join("text")
        .attr("x", d => x(d.value) + (config.essential.averages.labelOffset?.x || 5))
        .attr("y", d => y(d.group) + y.bandwidth() / 2 + (config.essential.averages.labelOffset?.y || 0))
        .attr("dy", "0.35em")
        .attr("fill", config.essential.averages.labelColour || "#444")
        .text(d => {
          const format = d3.format(config.essential.averages.labelFormat || config.essential.xAxisFormat);
          const prefix = config.essential.averages.labelPrefix || "Mean: ";
          return `${prefix}${format(d.value)}`;
        });
    }
  }

  addAxisLabel({
    svgContainer: chart,
    xPosition: chart_width,
    yPosition: height - margin.top - margin.bottom + 40,
    text: config.essential.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chart_width
  });

  //create link to source
  d3.select("#source")
    .text("Source: " + config.essential.sourceText)

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}



d3.csv(config.essential.graphic_data_url)
  .then(data => {
    // First convert string values to numbers if needed
    data.forEach(d => {
      d.value = +d.value;  // Convert to number if it's a string
    });



    graphic_data = data;

    // Create visualization using pym
    pymChild = new pym.Child({
      renderCallback: drawGraphic
    });
  });
