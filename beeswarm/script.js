import {
  initialise,
  addSvg,
  addAxisLabel,
  createDelaunayOverlay,
  addSource,
  removeSpaces,
} from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js";

let graphic = d3.select("#graphic");
let pymChild = null;
let graphicData, size, xDomain, circleDist, radius;

function positionCircles(
  data,
  x,
  y,
  radius,
  layoutMethod = "binned",
  circleDist
) {
  if (layoutMethod === "force") {
    return positionCirclesWithForce(data, x, y, radius);
  } else if (layoutMethod === "forceAccurate") {
    return positionCirclesWithAccurateForce(data, x, y, radius);
  } else {
    return positionCirclesWithBinning(data, x, y, radius, circleDist);
  }
}

function positionCirclesWithBinning(data, x, y, radius, circleDist) {
  // Calculate the binned values
  const minValue = d3.min(data, (d) => d.value);
  const maxValue = d3.max(data, (d) => d.value);
  const binSize = (maxValue - minValue) / config.numBands;

  // Create bins and assign vertical positions
  const bins = {};
  data.forEach((d) => {
    const binNumber = Math.floor((d.value - minValue) / binSize);
    d.valueRound = minValue + binNumber * binSize; // + (binSize / 2);

    // Create unique key for this group and bin combination
    const binKey = d.group + "_" + d.valueRound;

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
  const forceConfig = config.forceOptions;

  // Initialize positions
  data.forEach((d) => {
    d.x = x(d.value);
    d.y = y(d.group) + y.bandwidth() / 2;
    d.targetX = x(d.value); // Store target x position
    d.targetY = y(d.group) + y.bandwidth() / 2; // Store target y position
  });

  // Group data by group for separate simulations
  const groupedData = d3.groups(data, (d) => d.group);

  groupedData.forEach(([groupName, groupData]) => {
    const groupY = y(groupName);
    const groupHeight = y.bandwidth();

    // Create force simulation for this group
    const simulation = d3
      .forceSimulation(groupData)
      .alphaMin(forceConfig.alphaMin || 0.001)
      .velocityDecay(forceConfig.velocityDecay || 0.2)
      .force(
        "x",
        d3.forceX((d) => d.targetX).strength(forceConfig.centerStrength || 0.1)
      )
      .force(
        "y",
        d3.forceY((d) => d.targetY).strength(forceConfig.centerStrength || 0.1)
      )
      .force(
        "collide",
        d3
          .forceCollide()
          .radius(radius * 0.6) // Slightly smaller than visual radius for tighter packing
          .strength(forceConfig.strength || 0.5)
      )
      // .force('manybody',d3.forceManyBody().strength(-50))
      .force("boundary", boundaryForce(groupY, groupY + groupHeight, radius));

    // Run simulation for specified iterations
    for (let i = 0; i < (forceConfig.iterations || 120); ++i) {
      simulation.tick();
    }

    simulation.stop();
  });

  return data;
}

function positionCirclesWithAccurateForce(data, x, y, radius) {
  const visualRadius = radius / 2;

  // Group data by group and resolve overlaps within each row.
  const groupedData = d3.groups(data, (d) => d.group);

  groupedData.forEach(([groupName, groupData]) => {
    const rowTop = y(groupName);
    const rowBottom = rowTop + y.bandwidth();
    const targetY = rowTop + y.bandwidth() / 2;

    const swarm = new AccurateBeeswarm(groupData, visualRadius, (d) =>
      x(d.value)
    ).withTiesBrokenByArrayOrder();

    const positioned = swarm.calculateYPositions();

    positioned.forEach((point) => {
      point.datum.x = point.x;
      point.datum.y = Math.max(
        rowTop + visualRadius,
        Math.min(rowBottom - visualRadius, targetY + point.y)
      );
    });
  });

  return data;
}

// Adapted from https://github.com/jtrim-ons/accurate-beeswarm-plot
class AccurateBeeswarm {
  constructor(items, radius, xFun) {
    this.items = items;
    this.diameter = radius * 2;
    this.diameterSq = this.diameter * this.diameter;
    this.xFun = xFun;
    this.tieBreakFn = (x) => x;
    this._oneSided = false;
  }

  withTiesBrokenRandomly() {
    this.tieBreakFn = this._sfc32(0x9e3779b9, 0x243f6a88, 0xb7e15162, 1);
    return this;
  }

  withTiesBrokenByArrayOrder() {
    this.tieBreakFn = (x, i) => i;
    return this;
  }

  oneSided() {
    this._oneSided = true;
    return this;
  }

  calculateYPositions() {
    const all = this.items
      .map((d, i) => ({
        datum: d,
        originalIndex: i,
        x: this.xFun(d),
        y: null,
        placed: false,
        minPositiveY: 0,
        maxNegativeY: 0,
        score: 0,
        bestPosition: 0,
        heapPos: -1,
      }))
      .sort((a, b) => a.x - b.x);

    all.forEach((d, i) => {
      d.index = i;
    });

    const tieBreakFn = this.tieBreakFn;
    all.forEach((d) => {
      d.tieBreaker = tieBreakFn(d.x, d.originalIndex);
    });

    const pq = new AccurateBeeswarmPriorityQueue();
    pq.push(...all);

    while (!pq.isEmpty()) {
      const item = pq.pop();
      item.placed = true;
      item.y = item.bestPosition;
      this._updateYBounds(item, all, pq);
    }

    all.sort((a, b) => a.originalIndex - b.originalIndex);
    return all.map((d) => ({ datum: d.datum, x: d.x, y: d.y }));
  }

  // Random number generator: https://stackoverflow.com/a/47593316
  _sfc32(a, b, c, d) {
    const rng = function () {
      a >>>= 0;
      b >>>= 0;
      c >>>= 0;
      d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = c + (c << 3) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      t = (t + d) | 0;
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };

    for (let i = 0; i < 10; i++) {
      rng();
    }

    return rng;
  }

  _updateYBounds(item, all, pq) {
    for (const step of [-1, 1]) {
      let xDist;
      for (
        let i = item.index + step;
        i >= 0 &&
        i < all.length &&
        (xDist = Math.abs(item.x - all[i].x)) < this.diameter;
        i += step
      ) {
        const other = all[i];
        if (other.placed) {
          continue;
        }

        const yDist = Math.sqrt(this.diameterSq - xDist * xDist);
        other.minPositiveY = Math.max(other.minPositiveY, item.y + yDist);

        const prevScore = other.score;
        other.score = other.minPositiveY;
        other.bestPosition = other.minPositiveY;

        if (!this._oneSided) {
          other.maxNegativeY = Math.min(other.maxNegativeY, item.y - yDist);
          if (-other.maxNegativeY < other.score) {
            other.score = -other.maxNegativeY;
            other.bestPosition = other.maxNegativeY;
          }
        }

        if (other.score > prevScore) {
          pq.deprioritise(other);
        }
      }
    }
  }
}

class AccurateBeeswarmPriorityQueue {
  parent(i) {
    return ((i + 1) >>> 1) - 1;
  }

  left(i) {
    return (i << 1) + 1;
  }

  right(i) {
    return (i + 1) << 1;
  }

  constructor() {
    this.TOP = 0;
    this._heap = [];
  }

  size() {
    return this._heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  peek() {
    return this._heap[this.TOP];
  }

  push(...values) {
    values.forEach((value) => {
      value.heapPos = this.size();
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }

  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > this.TOP) {
      this._swap(this.TOP, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  // Caution: this only works if new priority is <= old one.
  deprioritise(item) {
    this._siftDown(item.heapPos);
  }

  _greater(i, j) {
    const a = this._heap[i];
    const b = this._heap[j];
    if (a.score < b.score) {
      return true;
    }
    if (a.score > b.score) {
      return false;
    }
    return a.tieBreaker < b.tieBreaker;
  }

  _swap(i, j) {
    const tmp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = tmp;
    this._heap[i].heapPos = i;
    this._heap[j].heapPos = j;
  }

  _siftUp() {
    let node = this.size() - 1;
    while (node > this.TOP && this._greater(node, this.parent(node))) {
      this._swap(node, this.parent(node));
      node = this.parent(node);
    }
  }

  _siftDown(node = this.TOP) {
    let l;
    let r;
    const sz = this.size();
    while (
      ((l = this.left(node)),
      (r = this.right(node)),
      (l < sz && this._greater(l, node)) || (r < sz && this._greater(r, node)))
    ) {
      const maxChild = r < sz && this._greater(r, l) ? r : l;
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
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

  force.initialize = function (_) {
    nodes = _;
  };

  return force;
}

function drawGraphic() {
  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  let margin = config.margin[size];
  let groups = d3.groups(graphicData, (d) => d.group);
  let chartWidth =
    parseInt(graphic.style("width")) - margin.left - margin.right;
  let height = config.seriesHeight[size] * groups.length;

  if (config.legend.show) {
    // Set up the legend
    const legenditem = d3
      .select("#legend")
      .selectAll("div.legend--item")
      .data([[config.legend.label, config.averages.colour]])
      .enter()
      .append("div")
      .attr("class", "legend--item");

    legenditem
      .append("div")
      .attr("class", "legend--icon--refline")
      .style("background-color", function (d) {
        return d[1];
      });

    legenditem
      .append("div")
      .append("p")
      .attr("class", "legend--text")
      .html(function (d) {
        return d[0];
      });
  }

  // set up dropdown
  const dropdownData = buildDropdownData(graphicData, config);

  function buildDropdownData(graphicData, config) {
    if (config.multiHighlight) {
      const groups = d3.group(graphicData, d => d.areanm);

      const dropdownData = Array.from(groups, ([areanm, points]) => ({
        id: areanm,
        label: areanm,
        ids: points.map(p => p.originalId),
        group: points[0].group,
      })).sort((a, b) => a.label.localeCompare(b.label));

      return dropdownData;
    }

    return graphicData
      .slice()
      .sort((a, b) => a.areanm.localeCompare(b.areanm))
      .map((point) => ({
        id: point.originalId,
        label: point.areanm,
        group: point.group,
      }));
  }


  //remove and then add dropdown again.
  d3.select("#select").selectAll("*").remove();

  const select = new EnhancedSelect({
    containerId: "select",
    options: dropdownData,
    label: "Choose a point",
    placeholder: "Select a data point",
    mode: "default",
    idKey: "id",
    labelKey: "label",
    hideLabel:true,
    groupKey: config.multiHighlight ? "" : "group",
    onChange: (selectedValue) => {
      overlay.clearHighlight();
      if (!selectedValue) return;
      if (config.multiHighlight) {
        selectedValue.ids.forEach(originalId => {
          const overlayIndex = overlayIndexByOriginalId.get(originalId);
          if (overlayIndex !== undefined) {
            overlay.highlightAll(overlayIndex);
          }
        });
      } else {
        const overlayIndex = overlayIndexByOriginalId.get(selectedValue.id);
        if (overlayIndex !== undefined) {
          overlay.highlightPoint(overlayIndex);
        }
      }
    }
  });

  const min = d3.min(graphicData, (d) => +d["value"]);
  const max = d3.max(graphicData, (d) => +d["value"]);

  if (config.xDomain == "auto") {
    xDomain = [min, max];
  } else {
    xDomain = config.xDomain;
  }

  //set up scales
  const x = d3.scaleLinear().range([0, chartWidth]).domain(xDomain);

  const y = d3
    .scaleBand()
    .domain(groups.map((d) => d[0]))
    .rangeRound([margin.top, height - margin.bottom])
    .padding(0.07);

  //set up xAxis generator
  let xAxis = d3
    .axisBottom(x)
    .ticks(config.xAxisTicks[size])
    .tickSize(-height + margin.bottom + (config.topXAxis ? margin.top : y(y.domain()[0])))
    .tickFormat(d3.format(config.xAxisFormat));

  let xAxisTop = d3
    .axisTop(x)
    .ticks(config.xAxisTicks[size])
    .tickSize(0)
    .tickFormat(d3.format(config.xAxisFormat));

  if (config.radius == "auto") {
    radius = (x(x.domain()[1]) - x(x.domain()[0])) / (config.numBands * 1.1);
  } else {
    radius = config.radius;
  }

  if (config.circleDist == "auto") {
    circleDist =
      (y.bandwidth() * 0.95 - radius) / d3.max(graphicData, (d) => d.value);
  } else {
    circleDist = config.circleDist * radius;
  }

  let chart = addSvg({
    svgParent: graphic,
    chartWidth: chartWidth,
    height: height + margin.top + margin.bottom,
    margin: margin,
  });

  // bottom x axis
  chart
    .append("g")
    .attr(
      "transform",
      (d) => "translate(0," + (height - margin.bottom) + ")"
    )
    .attr("class", "x axis")
    .call(xAxis);

  // Top x axis
  if (config.topXAxis) {
    chart
      .append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .attr("class", "x axis top")
      .call(xAxisTop);
  }

  // Grey boxes to contain the bees
  chart
    .append("g")
    .attr("fill", "#d7d7d7")
    .attr("opacity", 0.25)
    .selectAll("rect")
    .data(y.domain())
    .join("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d))
    .attr("width", () => x(x.domain()[1]) - x(x.domain()[0]))
    .attr("height", y.bandwidth);

  // group labels
  if (groups.length > 1) {
    chart
      .append("g")
      .attr("fill", "#444")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.95)
      .attr("paint-order", "stroke")
      .selectAll("text")
      .data(y.domain())
      .join("text")
      .attr("x", 5)
      .attr("y", (d) => y(d) + 17)
      .text((d) => d);
  }

  // Add average lines if they're defined in config
  if (config.averages && config.averages.show) {
    // Create average lines
    chart
      .append("g")
      .attr("class", "average-lines")
      .selectAll("line")
      .data(config.averages.values)
      .join("line")
      .attr("x1", (d) => x(d.value))
      .attr("x2", (d) => x(d.value))
      .attr("y1", (d) => y(d.group))
      .attr("y2", (d) => y(d.group) + y.bandwidth())
      .attr("stroke", config.averages.colour || "#444")
      .attr("stroke-width", config.averages.strokeWidth || 2)
      .attr("stroke-dasharray", config.averages.strokeDash || "");

    // Add average labels if enabled
    if (config.averages.showLabels) {
      chart
        .append("g")
        .attr("class", "average-labels")
        .selectAll("text")
        .data(config.averages.values)
        .join("text")
        .attr("x", (d) => x(d.value) + (config.averages.labelOffset?.x || 5))
        .attr(
          "y",
          (d) =>
            y(d.group) +
            y.bandwidth() / 2 +
            (config.averages.labelOffset?.y || 0)
        )
        .attr("dy", "0.35em")
        .attr("fill", config.averages.labelColour || "#444")
        .text((d) => {
          const format = d3.format(
            config.averages.labelFormat || config.xAxisFormat
          );
          const prefix = config.averages.labelPrefix || "Mean: ";
          return `${prefix}${format(d.value)}`;
        });
    }
  }

  // Position circles based on selected method
  const positionedData = positionCircles(
    [...graphicData],
    x,
    y,
    radius,
    config.layoutMethod || "binned",
    circleDist
  );

  // Draw circles with positioned data
  chart
    .append("g")
    .attr("fill", config.colourPalette)
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .selectAll("circle")
    .data([...positionedData].reverse())
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", radius / 2)
    .attr("class", (d) => `circle-${d.cleanId}`)
    .append("title")
    .text((d) => d.areanm + " " + d.value);

  const positionedOverlayData = positionedData
    .map((d, index) => ({
      xvalue: d.x,
      yvalue: d.y,
      name: d.areanm,
      group: d.group,
      value: d.value,
      formattedValue: d3.format(".1f")(d.value),
      originalId: d.originalId,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const overlayIndexByOriginalId = new Map(
    positionedOverlayData.map((d, i) => [d.originalId, i])
  );

  // Add Delaunay overlay
  const overlay = createDelaunayOverlay({
    svgContainer: chart,
    data: positionedOverlayData,
    chartWidth: chartWidth,
    height: height - margin.top - margin.bottom,
    xScale: (d) => d,
    yScale: d3
      .scaleLinear()
      .domain([0, height - margin.top - margin.bottom])
      .range([0, height - margin.top - margin.bottom]),
    tooltipConfig: {
      xLabel: config.xAxisLabel || "Value",
      xValueFormat: d3.format(".1f"),
      showYValue: false,
      showSize: false,
      backgroundColor: "#fff",
    },
    shape: () => "circle",
    circleSize: Math.PI * (radius / 2) * (radius / 2),
    getSymbolSize: () => Math.PI * (radius / 2) * (radius / 2),
    sizeScale: null,
    sizeField: null,
    radius: 25,
    margin: margin,
    multiHighlight: config.multiHighlight,
    highlightFillColour: ONScolours.highlightOrange
  });

  

  addAxisLabel({
    svgContainer: chart,
    xPosition: chartWidth,
    yPosition: height + margin.bottom - 10,
    text: config.xAxisLabel,
    textAnchor: "end",
    wrapWidth: chartWidth,
  });

  //create link to source
  addSource("source", config.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.graphicDataURL).then((data) => {
  // First convert string values to numbers if needed
  data.forEach((d, index) => {
    d.value = +d.value; // Convert to number if it's a string
    d.originalId = index; // Add stable ID
    d.cleanId = removeSpaces(d.areanm)
  });



  graphicData = data;

  // Create visualization using pym
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});



