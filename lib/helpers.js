// Global variables
const allAnnotations = []

/**
 * Initialises the chart by clearing previous graphics, setting accessibility text,
 * and determining chart size based on the current screen width.
 * @param {string} size - Desired chart size; recalculated based on screen width.
 * @returns {string} 'sm', 'md', or 'lg' depending on breakpoints.
 */
import { globalConfig } from "./globalConfig.js";

export function initialise(size, overrides = {}) {
  // Merge globalConfig with overrides
  const breakpointConfig = { ...globalConfig, ...overrides };
  const thresholdMedium = breakpointConfig.mediumBreakpoint;
  const thresholdSmall = breakpointConfig.mobileBreakpoint;

  // population accessible summary (if needed, adjust as per your logic)
  d3.select("#accessibleSummary").html(config.accessibleSummary);

  // clear out existing graphics
  d3.select("#graphic").selectAll("*").remove();
  d3.select("#legend").selectAll("*").remove();

  // set variables for chart dimensions dependent on width of #graphic
  const graphicWidth = parseInt(d3.select("#graphic").style("width"));
  if (graphicWidth < thresholdSmall) {
    size = "sm";
  } else if (graphicWidth < thresholdMedium) {
    size = "md";
  } else {
    size = "lg";
  }

  return size;
}

/**
 * Calculates the width for individual charts in a grid layout.
 * @param {Object} params
 * @param {number} params.screenWidth - Total available width.
 * @param {number} params.chartEvery - Number of charts per row.
 * @param {Object} params.chartMargin - Chart margins with 'left' and 'right' properties.
 * @param {number} [params.chartGap=10] - Space between charts in pixels.
 * @returns {number} Width of a single chart.
 */
export function calculateChartWidth({
  screenWidth,
  chartEvery,
  chartMargin,
  chartGap = 10,
}) {
  if (config.dropYAxis) {
    // Chart width calculation allowing for {chartGap}px left margin between the charts
    const chartWidth =
      (screenWidth - chartMargin.left - (chartEvery - 1) * chartGap) /
        chartEvery -
      chartMargin.right;
    return chartWidth;
  } else {
    const chartWidth =
      screenWidth / chartEvery - chartMargin.left - chartMargin.right;
    return chartWidth;
  }
}

export function addSvg({ svgParent, chartWidth, height, margin }) {
  return svgParent
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", height)
      .attr("class", "chart")
      // .style('background-color', '#fff')
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

export function addDataLabels({
  svgContainer = svg,
  data,
  chartWidth,
  labelPositionFactor = 7,
  xScaleFunction = x,
  yScaleFunction = y,
  y2function = null,
}) {
  svgContainer
    .selectAll("text.dataLabels")
    .data(data)
    .join("text")
    .attr("class", "dataLabels")
    .attr("x", (d) =>
      d.value > 0
        ? xScaleFunction(d.value)
        : Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) <
          chartWidth / labelPositionFactor
        ? xScaleFunction(0)
        : xScaleFunction(d.value)
    )
    .attr("dx", (d) =>
      d.value > 0
        ? Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) <
          chartWidth / labelPositionFactor
          ? 3
          : -3
        : 3
    )
    .attr("y", (d) =>
      y2function
        ? yScaleFunction(d.name) +
          y2function(d.category) +
          y2function.bandwidth() / 2
        : yScaleFunction(d.name) + yScaleFunction.bandwidth() / 2
    )
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", (d) =>
      d.value > 0
        ? Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) <
          chartWidth / labelPositionFactor
          ? "start"
          : "end"
        : "start"
    )
    .attr("fill", (d) =>
      Math.abs(xScaleFunction(d.value) - xScaleFunction(0)) <
      chartWidth / labelPositionFactor
        ? "#414042"
        : "#ffffff"
    )
    .text((d) => d3.format(config.dataLabels.numberFormat)(d.value));
}

export function addDataLabelsVertical({
  svgContainer = svg,
  data,
  xScaleFunction = x,
  yScaleFunction = y,
  y2function,
  minColumnLabelHeight = 20,
}) {
  svgContainer
    .selectAll("text.dataLabels")
    .data(data)
    .join("text")
    .attr("class", "dataLabels")
    .attr(
      "x",
      (d) =>
        xScaleFunction(d.name) +
        y2function(d.category) +
        y2function.bandwidth() / 2
    )
    .attr("y", (d) => {
      const columnHeight = Math.abs(
        yScaleFunction(d.value) - yScaleFunction(0)
      );
      if (d.value > 0) {
        if (columnHeight < minColumnLabelHeight) {
          return yScaleFunction(d.value) - 5; // Outside the column (above)
        } else {
          return yScaleFunction(d.value) + 12; // Inside the column (bottom)
        }
      } else {
        if (columnHeight < minColumnLabelHeight) {
          return yScaleFunction(0) - 5; // Outside the column (above)
        } else {
          return yScaleFunction(d.value) - 10; // Inside the column (bottom)
        }
      }
    })
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", (d) => {
      const columnHeight = Math.abs(
        yScaleFunction(d.value) - yScaleFunction(0)
      );
      if (d.value > 0) {
        if (columnHeight < minColumnLabelHeight) {
          return "auto"; // Outside the column (above)
        } else {
          return "middle"; // Inside the column (bottom)
        }
      } else {
        if (columnHeight < minColumnLabelHeight) {
          return "auto"; // Outside the column (above)
        } else {
          return "middle"; // Inside the column (bottom)
        }
      }
    })
    .attr("fill", (d) => {
      const columnHeight = Math.abs(
        yScaleFunction(d.value) - yScaleFunction(0)
      );
      if (columnHeight < minColumnLabelHeight) {
        return "#414042"; // Outside the column
      } else {
        return "#ffffff"; // Inside the column
      }
    })
    .text((d) => d3.format(config.dataLabels.numberFormat)(d.value));
}

export function addChartTitleLabel({
  svgContainer = svg, //Default values, but can be overwritten in the function call
  xPosition = 0, //Default values, but can be overwritten in the function call
  yPosition = -15, //Default values, but can be overwritten in the function call
  text,
  wrapWidth,
}) {
  svgContainer
    .append("g")
    .attr("transform", "translate(0, 0)")
    .append("text")
    .attr("x", xPosition)
    .attr("y", yPosition)
    // .attr('dy', -15)
    .attr("class", "title")
    .text(text)
    .attr("text-anchor", "start")
    .call(wrap, wrapWidth);
}

export function addAxisLabel({
  svgContainer = svg,
  xPosition,
  yPosition,
  text,
  textAnchor = "end",
  wrapWidth,
}) {
  svgContainer
    .append("g")
    .append("text")
    .attr("x", xPosition)
    .attr("y", yPosition)
    .attr("class", "axis--label")
    .text(text)
    .attr("text-anchor", textAnchor)
    .call(wrap, wrapWidth);
}

export function addSource(elementId, sourceText) {
  if (sourceText.startsWith("Source"))
    console.error('Source text should not start with "Source".');
  if (sourceText.includes(" - "))
    console.warn("Source text should use an en dash instead of -.");
  d3.select("#" + elementId).text("Source: " + sourceText);
}

export function diamondShape(sideLength = 10) {
  // Calculate the distance from center to each point (diamond with sideLength sides)
  const distance = sideLength / Math.sqrt(2);

  // Define the diamond shape as a path
  const path = `
    M 0 ${-distance}
    L ${distance} 0
    L 0 ${distance}
    L ${-distance} 0
    Z
  `;

  return path; // Return the path string
}

// text wrap functions
export function wrap(text, width) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y") ? text.attr("y") : 0,
      x = text.attr("x") ? text.attr("x") : 0,
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", x);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("dy", lineHeight + "em")
          .text(word);
      }
    }
    let breaks = text.selectAll("tspan").size();
    text.attr("y", function () {
      return y - 6 * (breaks - 1);
    });
  });
}

export function wrap2(
  text,
  width,
  dyAdjust,
  lineHeightEms,
  lineHeightSquishFactor,
  splitOnHyphen,
  centreVertically
) {
  // Use default values for the last three parameters if values are not provided.
  if (!lineHeightEms) lineHeightEms = 1.05;
  if (!lineHeightSquishFactor) lineHeightSquishFactor = 1;
  if (splitOnHyphen == null) splitOnHyphen = true;
  if (centreVertically == null) centreVertically = "middle";

  text.each(function () {
    var text = d3.select(this),
      x = text.attr("x"),
      y = text.attr("y");

    var words = [];
    text
      .text()
      .split(/\s+/)
      .forEach(function (w) {
        if (splitOnHyphen) {
          var subWords = w.split("-");
          for (var i = 0; i < subWords.length - 1; i++)
            words.push(subWords[i] + "-");
          words.push(subWords[subWords.length - 1] + " ");
        } else {
          words.push(w + " ");
        }
      });

    text.text(null); // Empty the text element

    // `tspan` is the tspan element that is currently being added to
    var tspan = text.append("tspan");

    var line = ""; // The current value of the line
    var prevLine = ""; // The value of the line before the last word (or sub-word) was added
    var nWordsInLine = 0; // Number of words in the line
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      prevLine = line;
      line = line + word;
      ++nWordsInLine;
      tspan.text(line.trim());
      if (tspan.node().getComputedTextLength() > width && nWordsInLine > 1) {
        // The tspan is too long, and it contains more than one word.
        // Remove the last word and add it to a new tspan.
        tspan.text(prevLine.trim());
        prevLine = "";
        line = word;
        nWordsInLine = 1;
        tspan = text.append("tspan").text(word.trim());
      }
    }

    var tspans = text.selectAll("tspan");

    var h = lineHeightEms;
    // Reduce the line height a bit if there are more than 2 lines.
    if (tspans.size() > 2)
      for (var i = 0; i < tspans.size(); i++) h *= lineHeightSquishFactor;

    tspans.each(function (d, i) {
      // Calculate the y offset (dy) for each tspan so that the vertical centre
      // of the tspans roughly aligns with the text element's y position.
      var dy = i * h + dyAdjust;
      if (centreVertically === "middle") {
        dy -= ((tspans.size() - 1) * h) / 2;
      } else if (centreVertically === "top") {
        dy -= tspans.size() * h; // Shift the text up by its entire height
      } else {
        // For any other value of centreVertically (including "bottom"), do nothing (default behavior).
      }
      d3.select(this)
        .attr("y", y)
        .attr("x", x)
        .attr("dy", dy + "em");
    });
  });
}

//Annotations

// ========== UTILITY FUNCTIONS ==========
function generateAnnotationId() {
  return `annotation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getTextPositionOffsets(position, variant = "arrow") {
  const positions = {
    arrow: {
      above: { x: 0, y: 0, anchor: "middle", wrap: "top" },
      below: { x: 0, y: 10, anchor: "middle", wrap: "bottom" },
      left: { x: -10, y: 0, anchor: "end", wrap: "middle" },
      right: { x: 10, y: 0, anchor: "start", wrap: "middle" },
      default: { x: 0, y: 0, anchor: "start", wrap: "middle" }
    },
    verticalLine: {
      left: { x: -9, anchor: "end", wrap: "middle" },
      right: { x: 9, anchor: "start", wrap: "middle" }
    },
    horizontalLine: {
      above: { y: -10, anchor: "start", wrap: "middle" },
      below: { y: 10, anchor: "start", wrap: "middle" }
    },
    verticalRange: {
      right: { x: 10, anchor: "start", wrap: "middle" },
      left: { x: -10, anchor: "end", wrap: "middle" }
    }
  };
  return positions[variant][position] || positions[variant].default;
}

function getTextPositionOffsetsForRange(position, enclosure, orientation) {
  const positions = {
    vertical: {
      left: {
        inside: { x: 10, anchor: "start", wrap: "middle", start: "start" },
        outside: { x: -10, anchor: 'end', wrap: "middle", start: "start" }
      },
      right: {
        inside: { x: -10, anchor: 'end', wrap: "middle", start: "end" },
        outside: { x: 10, anchor: 'start', wrap: "middle", start: "end" }
      }
    },
    horizontal: {
      above: {
        inside: { y: 10, anchor: 'start', wrap: 'middle', start: 'top' },
        outside: { y: -10, anchor: 'start', wrap: 'middle', start: 'top' }
      },
      below: {
        inside: { y: -10, anchor: 'start', wrap: 'middle', start: 'bottom' },
        outside: { y: -10, anchor: 'start', wrap: 'middle', start: 'bottom' }
      }
    }
  };
  return positions[orientation][position][enclosure];
}

function appendWrappedText(svg, x, y, text, id, anchor, wrapWidth, centerWrap) {
  return svg.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('class', `annotation annotation-text ${id}`)
    .text(text)
    .attr('text-anchor', anchor)
    .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
}

function appendBaseMarker(svg, x, y, id) {
  return svg.append("circle")
    .attr("class", `annotation annotation-marker base-marker ${id}`)
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 3)
    .style("fill", "green")
    .style("stroke", "darkgreen")
    .style("stroke-width", 1);
}

// Adds defs to svg for arrowheads
export function setupArrowhead(svgContainer) {
  const svgDefs = svgContainer.append("svg:defs");
  const arrowheadMarker = svgDefs
    .append("svg:marker")
    .attr("id", "annotation_arrowhead")
    .attr("class", "annotation_arrow")
    .attr("refX", 9)
    .attr("refY", 10)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadMarker.append("path").attr("d", "M2,5 L10,10 L2,15");

  const arrowheadLeft = svgDefs
    .append("svg:marker")
    .attr("id", "annotation_arrowhead_left")
    .attr("class", "annotation_arrow_left")
    .attr("refX", 3.27)
    .attr("refY", 3.86)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadLeft
    .append("path")
    .attr("stroke", "context-stroke")
    .attr("fill", "none")
    .attr("d", "M0.881836 1.45544L3.27304 3.84665L0.846591 6.2731");

  const arrowheadRight = svgDefs
    .append("svg:marker")
    .attr("id", "annotation_arrowhead_right")
    .attr("class", "annotation_arrow_right")
    .attr("refX", 3.27)
    .attr("refY", 3.86)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadRight
    .append("path")
    .attr("stroke", "context-stroke")
    .attr("fill", "none")
    .attr("d", "M0.881836 1.45544L3.27304 3.84665L0.846591 6.2731");
}

export function setupMobileAnnotations() {
  // Select the body as the parent container.
  const parent = d3.select("body");

  // Check if the div already exists within the body.
  if (parent.select("div.mobile-annotation-footnotes-div").empty()) {
    // If it doesn't exist, insert a new div and add the class.
    parent.insert("div", "#source") // Inserts before the first child div
      .attr("class", "mobile-annotation-footnotes-div");
  } else {
    parent.select("div.mobile-annotation-footnotes-div").selectAll("*").remove()
  }
}

export function setupAnnotationToolbar() {
  const parent = d3.select("body");

  // ---- Toolbar setup ----
  if (parent.select("div#annotation-toolbar").empty()) {
    parent
      .insert("div", "#graphic")
      .attr("id", "annotation-toolbar");
  } else {
    parent.select("div#annotation-toolbar").selectAll("*").remove();
  }

  // ---- Annotation control panel setup ----
  const sourceH5 = d3.select("h5#source");

  if (!sourceH5.empty() && d3.select("#annotation-control-panel").empty()) {
    const panel = document.createElement("div");
    panel.id = "annotation-control-panel";

    // Insert *after* h5#source
    sourceH5.node().after(panel);
  }
}



function drawCurve(xCoord, yCoord, xDifference, yDifference, curveRight) {
  //the height of the curve, as a proportion of the length of direct line from A to B. Default should be 0.25
  var curveHeight = 0.25;

  //   var xDifference = x2 - x1
  //   var yDifference = y2 - y1
  //pythag to get the length of the line
  var M =
    Math.sqrt(Math.pow(xDifference, 2) + Math.pow(yDifference, 2)) *
    curveHeight;
  if (curveRight == true) {
    var M = 0 - M;
  }

  // Find midpoint J
  var Jx = xCoord + xDifference / 2;
  var Jy = yCoord + yDifference / 2;

  // We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
  //   var a = x2 - x1
  var asign = xDifference < 0 ? -1 : 1;
  //   var b = y2 - y1
  var bsign = yDifference < 0 ? -1 : 1;
  var theta = Math.atan(yDifference / xDifference);

  // Find the point that's perpendicular to J on side
  var costheta = asign * Math.cos(theta);
  var sintheta = asign * Math.sin(theta);

  // Find c and d
  var c = M * sintheta;
  var d = M * costheta;

  // Use c and d to find Kx and Ky
  var Kx = Jx - c;
  var Ky = Jy + d;

  var x2coord = xCoord + xDifference;
  var y2coord = yCoord + yDifference;

  return (
    "M" +
    x2coord +
    "," +
    y2coord +
    "Q" +
    Kx +
    "," +
    Ky +
    " " +
    xCoord +
    "," +
    yCoord
  );
}

function annotationMobileAlternative(
  svgName,
  xValue,
  yValue,
  TextOffsetX,
  MobileCircleOffsetX,
  MobileCircleOffsetY,
  mobileTextNumber,
  wrapWidth,
  thisText,
  wrap2,
  centerWrap
) {
  // Add circle to the main SVG
  svgName.append('circle')
    .attr('cx', xValue + 1.7 * (TextOffsetX) + MobileCircleOffsetX)
    .attr('cy', yValue + MobileCircleOffsetY)
    .attr('r', 9)
    .attr('class', 'annotation mobile-annotation-circle');

  // Add number inside circle
  svgName.append('text')
    .attr('x', xValue + 1.7 * (TextOffsetX) + MobileCircleOffsetX)
    .attr('y', yValue + MobileCircleOffsetY)
    .attr('class', 'annotation mobile-annotation-circle-text')
    .text(mobileTextNumber)
    .attr("text-anchor", "middle")
    .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);

  // Create footnote
  const emptyFootnotesDiv = d3.select(".mobile-annotation-footnotes-div");

  const footnoteRowDiv = emptyFootnotesDiv
    .append("div")
    .attr("class", "mobile-annotation-footnote-row")
    .style("background-color", "none")
    .style("display", "flex")
    .style("font-size", "14px");

  // Add SVG circle and number to footnote
  const svg = footnoteRowDiv
    .append("svg")
    .attr("width", "30")
    .attr("height", "23")
    .style("background-color", "none");

  svg
    .append("circle")
    .attr("cx", 15)
    .attr("cy", 10)
    .attr("r", 9)
    .attr("class", "mobile-annotation-circle");

  svg
    .append("text")
    .attr("x", 15)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("class", "mobile-annotation-circle-text")
    .text(mobileTextNumber);

  // Add text description to footnote
  footnoteRowDiv.append("div").attr("height", "23").text(thisText);
}

export function addAnnotationText(
  svgName,
  xValue,
  yValue, TextOffsetX, TextOffsetY, thisText, textAnchor, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size, editable = false, id) {

  let centerWrap = 'middle';
  const annotationId = id || generateAnnotationId();

  if (mobileText != true || size == "lg") {
    //adds text

    appendWrappedText(svgName, xValue + TextOffsetX, yValue + TextOffsetY, thisText, annotationId, textAnchor, wrapWidth, centerWrap)

    if (editable) {
      appendBaseMarker(svgName, xValue, yValue, annotationId);

      // Make text clickable to open modal
      svgName.select(`.annotation-text.${annotationId}`)
        .style("cursor", "pointer")
        .on("click", function (event) {
          event.stopPropagation();
          openAnnotationModal({
            title: "Edit text annotation",
            currentText: thisText,
            currentWrapWidth: wrapWidth,
            showPosition: false,
            onApply: function (newValues) {
              thisText = newValues.text;
              wrapWidth = newValues.wrapWidth;

              const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

              allAnnotations[annotationIndex] = {
                ...allAnnotations[annotationIndex],
                label: thisText,
                text: {
                  ...allAnnotations[annotationIndex].text,
                  wrapWidth: wrapWidth
                }
              };


              // Update the text
              svgName.select(`.annotation-text.${annotationId}`)
                .text(thisText)
                .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
            }
          });
        });
    }
  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

function openAnnotationModal(config) {
  // Create modal overlay
  const modal = d3.select("body")
    .append("div")
    .attr("class", "annotation-modal")
    .style("position", "fixed")
    .style("top", "0")
    .style("left", "0")
    .style("width", "100%")
    .style("height", "100%")
    .style("background", "rgba(0,0,0,0.5)")
    .style("z-index", "1000")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center");

  // Create modal content
  const modalContent = modal.append("div")
    .style("background", "white")
    .style("padding", "20px")
    .style("border-radius", "8px")
    .style("max-width", "400px")
    .style("width", "90%");

  modalContent.append("h3").text(config.title || "Edit Annotation");

  // Text input
  const textInput = modalContent.append("input")
    .attr("type", "text")
    .attr("value", config.currentText)
    .style("width", "100%")
    .style("margin", "10px 0")
    .style("padding", "5px");

  // Conditionally add text position select(s)
  let positionSelects = [];
  if (config.showPosition && config.positionOptions) {
    // Check if it's a multi-dimensional array or single array
    const isMultiDimensional = Array.isArray(config.positionOptions[0]);
    const positionGroups = isMultiDimensional ? config.positionOptions : [config.positionOptions];
    const currentPositions = Array.isArray(config.currentPosition) ? config.currentPosition : [config.currentPosition];
    const labels = config.positionLabels || ["Text Position"];

    positionGroups.forEach((options, index) => {
      const label = labels[index] || `Position ${index + 1}`;
      modalContent.append("label").text(label + ":");

      const positionSelect = modalContent.append("select")
        .style("width", "100%")
        .style("margin", "10px 0")
        .style("padding", "5px");

      options.forEach(pos => {
        positionSelect.append("option")
          .attr("value", pos)
          .property("selected", pos === (currentPositions[index] || currentPositions[0]))
          .text(pos);
      });

      positionSelects.push(positionSelect);
    });
  }

  // Wrap width input
  modalContent.append("label").text("Text Wrap Width:");
  const wrapInput = modalContent.append("input")
    .attr("type", "number")
    .attr("value", config.currentWrapWidth)
    .style("width", "100%")
    .style("margin", "10px 0")
    .style("padding", "5px");

  // Buttons
  const buttonContainer = modalContent.append("div")
    .style("margin-top", "20px")
    .style("text-align", "right");

  buttonContainer.append("button")
    .text("Cancel")
    .style("margin-right", "10px")
    .style("padding", "8px 16px")
    .on("click", () => modal.remove());

  buttonContainer.append("button")
    .text("Apply")
    .style("padding", "8px 16px")
    .style("background", "#007bff")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "4px")
    .on("click", function () {
      const newValues = {
        text: textInput.property("value"),
        wrapWidth: +wrapInput.property("value")
      };

      if (config.showPosition && positionSelects.length > 0) {
        if (positionSelects.length === 1) {
          // Single position select - return as string for backward compatibility
          newValues.position = positionSelects[0].property("value");
        } else {
          // Multiple position selects - return as array
          newValues.position = positionSelects.map(select => select.property("value"));
        }
      }

      config.onApply(newValues);
      modal.remove();
    });
}


export function addAnnotationArrow(svgName, xValue, yValue, arrowOffsetX, arrowOffsetY, xLength, yLength, curve, thisText, textPosition, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size, editable = false, id) {

  let TextOffsetX, TextOffsetY, textAnchor, centerWrap, curveRight;
  const annotationId = id || generateAnnotationId();

  if (curve == 'right') { curveRight = false } else { curveRight = true }

  ({ x: TextOffsetX, y: TextOffsetY, anchor: textAnchor, wrap: centerWrap } = getTextPositionOffsets(textPosition, "arrow"));

  if (mobileText != true || size == "lg") {
    //desktop
    svgName.append("path")
      .attr("class", `annotation annotation_arrow ${annotationId}`)
      // .data()
      .attr("d", function (d) {
        return drawCurve(
          //arrow start x and y values
          xValue + arrowOffsetX,
          yValue + arrowOffsetY,

          //arrow end x and y values
          xLength,
          yLength,

          //arrow is curving right rather than left
          curveRight
        );
      })
      //attaches the arrowhead
      .attr("marker-end", "url(#annotation_arrowhead)");

    //adds text
    appendWrappedText(svgName, xValue + xLength + TextOffsetX + arrowOffsetX, yValue + yLength + TextOffsetY + arrowOffsetY, thisText, annotationId, textAnchor, wrapWidth, centerWrap)

    if (editable) {
      // Make text clickable to open modal
      svgName.select(`.annotation-text.${annotationId}`)
        .style("cursor", "pointer")
        .on("click", function (event) {
          event.stopPropagation();
          openAnnotationModal({
            title: "Edit arrow annotation",
            currentText: thisText,
            currentPosition: [textPosition, curve],
            currentWrapWidth: wrapWidth,
            showPosition: true,
            positionOptions: [["above", "below", "left", "right"], ["left", "right"]],
            positionLabels: ["position", 'curve'],
            onApply: function (newValues) {
              thisText = newValues.text;
              [textPosition, curve] = newValues.position;
              wrapWidth = newValues.wrapWidth;



              updatePositions();

              svgName.select(`.annotation-text.${annotationId}`)
                .text(thisText)
                .attr('text-anchor', textAnchor)
                .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);


            }
          });
        });

      appendBaseMarker(svgName, xValue, yValue, annotationId);

      const tailHandle = svgName.append("circle")
        .attr("class", `annotation annotation-handle tail-handle ${annotationId}`)
        .attr("cx", xValue + arrowOffsetX)
        .attr("cy", yValue + arrowOffsetY)
        .attr("r", 5)
        .style("fill", "blue")
        .style("cursor", "move")
        .call(d3.drag()
          .on("drag", function (event) {
            const newX = event.x - xValue;
            const newY = event.y - yValue;
            arrowOffsetX = newX;
            arrowOffsetY = newY;
            updatePositions();
          })
        );

      const headHandle = svgName.append("circle")
        .attr("class", `annotation annotation-handle head-handle ${annotationId}`)
        .attr("cx", xValue + xLength + arrowOffsetX)
        .attr("cy", yValue + yLength + arrowOffsetY)
        .attr("r", 5)
        .style("fill", "red")
        .style("cursor", "move")
        .call(d3.drag()
          .on("drag", function (event) {
            xLength = event.x - xValue - arrowOffsetX;
            yLength = event.y - yValue - arrowOffsetY;
            updatePositions();
          })
        );
    }


    function updatePositions() {
      if (curve == 'right') { curveRight = false } else { curveRight = true }

      // Update arrow path
      svgName.select(`.annotation_arrow.${annotationId}`)
        .attr("d", drawCurve(
          xValue + arrowOffsetX,
          yValue + arrowOffsetY,
          xLength,
          yLength,
          curveRight
        ));

      // Update handles
      svgName.select(`.tail-handle.${annotationId}`)
        .attr("cx", xValue + arrowOffsetX)
        .attr("cy", yValue + arrowOffsetY);

      svgName.select(`.head-handle.${annotationId}`)
        .attr("cx", xValue + xLength + arrowOffsetX)
        .attr("cy", yValue + yLength + arrowOffsetY);

      // Recalculate text position offsets
      if (textPosition == "above") {
        TextOffsetX = 0; TextOffsetY = 0; textAnchor = 'middle'; centerWrap = "top";
      } else if (textPosition == "below") {
        TextOffsetX = 0; TextOffsetY = 10; textAnchor = 'middle'; centerWrap = "bottom";
      } else if (textPosition == "left") {
        TextOffsetX = -10; TextOffsetY = 0; textAnchor = "end"; centerWrap = 'middle';
      } else if (textPosition == "right") {
        TextOffsetX = 10; TextOffsetY = 0; textAnchor = "start"; centerWrap = 'middle';
      }

      // Update text element position
      const textElement = svgName.select(`.annotation-text.${annotationId}`);
      textElement
        .attr('x', xValue + xLength + TextOffsetX + arrowOffsetX)
        .attr('y', yValue + yLength + TextOffsetY + arrowOffsetY);

      // Update all tspan positions
      textElement.selectAll('tspan')
        .attr('x', xValue + xLength + TextOffsetX + arrowOffsetX)
        .attr('y', yValue + yLength + TextOffsetY + arrowOffsetY);


      const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

      allAnnotations[annotationIndex] = {
        ...allAnnotations[annotationIndex],
        label: thisText,
        text: {
          ...allAnnotations[annotationIndex].text,
          wrapWidth: wrapWidth,
          position: textPosition
        },
        arrow: {
          ...allAnnotations[annotationIndex].arrow,
          arrowOffsetX: arrowOffsetX,
          arrowOffsetY: arrowOffsetY,
          lengthX: xLength,
          lengthY: yLength,
          curve: curve
        }
      };
    }
  } else {
    //mobile alternative
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

export function addDirectionArrow(svgName,
  direction,
  arrowAnchor,
  xValue, yValue, thisText, wrapWidth, wrapVerticalAlign = "middle", arrowColour = "#414042", editable = false, id) {

  let textAnchor = 'start', textOffsetX = 0, thisPath;
  const annotationId = id || generateAnnotationId();

  ({ textOffsetX, textAnchor, thisPath } = setDirectionArrow(direction, arrowAnchor));

  svgName.append('path')
    .attr("d", thisPath)
    .attr("class", `annotation direction-arrow ${annotationId}`)
    .attr("stroke", arrowColour)
    .attr("transform", "translate(" + xValue + "," + yValue + ")");;

  appendWrappedText(svgName, xValue + textOffsetX, yValue, thisText, annotationId, textAnchor, wrapWidth, wrapVerticalAlign)

  if (editable) {
    svgName.select(`.annotation-text.${annotationId}`)
      .style("cursor", "pointer")
      .on("click", function (event) {
        event.stopPropagation();
        openAnnotationModal({
          title: "Edit vertical line annotation",
          currentText: thisText,
          currentPosition: [direction, arrowAnchor],
          currentWrapWidth: wrapWidth,
          showPosition: true,
          positionLabels: ["Direction", 'Arrow anchor'],
          positionOptions: [["left", "right", "down", "up"], ["start", "end"]],
          onApply: function (newValues) {
            thisText = newValues.text;
            [direction, arrowAnchor] = newValues.position;
            wrapWidth = newValues.wrapWidth;

            ({ textOffsetX, textAnchor, thisPath } = setDirectionArrow(direction, arrowAnchor));

            const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

            allAnnotations[annotationIndex] = {
              ...allAnnotations[annotationIndex],
              label: thisText,
              text: {
                ...allAnnotations[annotationIndex].text,
                wrapWidth: wrapWidth,
              },
              arrow: {
                ...allAnnotations[annotationIndex].arrow,
                direction: direction,
              },
              position: {
                ...allAnnotations[annotationIndex].position,
                anchor: arrowAnchor
              }
            };

            svgName.select(`.direction-arrow.${annotationId}`)
              .attr("d", thisPath)

            svgName.select(`.annotation-text.${annotationId}`)
              .text(thisText)
              .attr('x', xValue + textOffsetX)
              .attr('text-anchor', textAnchor)
              .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, wrapVerticalAlign);
          }
        });
      });
  }

}

function setDirectionArrow(direction = 'right', arrowAnchor = 'start') {
  const textPadding = 5;
  const arrowOffset = 6

  let textOffsetX = 0;
  let textAnchor = 'start'

  if (arrowAnchor === 'start') {
    textAnchor = "start";
    textOffsetX = arrowOffset + textPadding;
  } else if (arrowAnchor === 'end') {
    textAnchor = "end";
    textOffsetX = -arrowOffset - textPadding;
  }

  const paths = {
    left: "M -5.5 0 L 5.5 -0 M -5.5 0 L -1.5 -4 M -5.5 0 L -1.5 4",
    right: "M 5.5 -0 L -5.5 0 M 5.5 -0 L 1.5 4 M 5.5 -0 L 1.5 -4",
    up: "M -0 -5.5 L 0 5.5 M -0 -5.5 L 4 -1.5 M -0 -5.5 L -4 -1.5",
    down: "M 0 5.5 L -0 -5.5 M 0 5.5 L -4 1.5 M 0 5.5 L 4 1.5"
  }

  return {
    textOffsetX,
    textAnchor,
    thisPath: paths[direction]
  };
}



/**
 * Adds a vertical annotation line to a chart, with optional text and mobile-friendly alternatives.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} height - Height of the line.
 * @param {number} xValue - X-coordinate of the line.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'left' or 'right' for text placement.
 * @param {number} [yValue=10] - Y-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {boolean} moveToBack - If true, sends line behind other elements.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 * @param {boolean} editable - If true can edit annotation
 */
export function addAnnotationLineVertical(svgName, height, xValue, thisText, textPosition = 'right', yValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, moveToBack, size, editable = false, id) {
  let TextOffsetX, textAnchor, centerWrap;
  const annotationId = id || generateAnnotationId();

  if (!yValue) yValue = 10;

  ({ x: TextOffsetX, anchor: textAnchor, wrap: centerWrap } = getTextPositionOffsets(textPosition, "verticalLine"));

  svgName
    .append("line")
    //the 0.5 gets line placed exactly
    .attr('x1', xValue + 0.5)
    .attr('x2', xValue + 0.5)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('class', `annotation annotation-line ${annotationId}`)
    .filter(function () {
      return moveToBack == true;
    })
    .lower();

  if (mobileText != true || size == "lg") {
    appendWrappedText(svgName, xValue + TextOffsetX, yValue, thisText, annotationId, textAnchor, wrapWidth, centerWrap)

    if (editable) {
      appendBaseMarker(svgName, xValue, yValue, annotationId)

      svgName.select(`.annotation-text.${annotationId}`)
        .style("cursor", "pointer")
        .on("click", function (event) {
          event.stopPropagation();
          openAnnotationModal({
            title: "Edit vertical line annotation",
            currentText: thisText,
            currentPosition: textPosition,
            currentWrapWidth: wrapWidth,
            showPosition: true,
            positionOptions: ["left", "right"],
            onApply: function (newValues) {
              thisText = newValues.text;
              textPosition = newValues.position;
              wrapWidth = newValues.wrapWidth;

              ({ x: TextOffsetX, anchor: textAnchor, wrap: centerWrap } = getTextPositionOffsets(textPosition, "verticalLine"));

              const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

              allAnnotations[annotationIndex] = {
                ...allAnnotations[annotationIndex],
                label: thisText,
                text: {
                  ...allAnnotations[annotationIndex].text,
                  wrapWidth: wrapWidth,
                },
                position: {
                  ...allAnnotations[annotationIndex].position,
                  text: textPosition
                }
              };


              // Update the text
              svgName.select(`.annotation-text.${annotationId}`)
                .text(thisText)
                .attr('x', xValue + TextOffsetX)
                .attr('text-anchor', textAnchor)
                .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
            }
          });
        });
    }
  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Adds a horizontal annotation line with optional text and mobile-friendly alternative.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} width - Width of the line.
 * @param {number} yValue - Y-coordinate of the line.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'above' or 'below' for text placement.
 * @param {number} [xValue=10] - X-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {boolean} moveToBack - If true, sends line behind other elements.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 * @param {boolean} editable - Boolean to make annotation editable
 */
export function addAnnotationLineHorizontal(svgName, width, yValue, thisText, textPosition = below, xValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, moveToBack, size, editable = false, id) {

  let TextOffsetY, textAnchor, centerWrap;
  const annotationId = id || generateAnnotationId();

  if (!xValue) xValue = 10;

  ({ y: TextOffsetY, anchor: textAnchor, wrap: centerWrap } = getTextPositionOffsets(textPosition, "horizontalLine"));


  svgName
    .append("line")
    //the 0.5 gets line placed exactly
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', yValue + 0.5)
    .attr('y2', yValue + 0.5)
    .attr('class', 'annotation annotation-line')
    .filter(function () {
      return moveToBack == true;
    })
    .lower();

  if (mobileText != true || size == "lg") {
    appendWrappedText(svgName, xValue, yValue + TextOffsetY, thisText, annotationId, textAnchor, wrapWidth, centerWrap)

    if (editable) {
      appendBaseMarker(svgName, xValue, yValue, annotationId)

      // Make text clickable to open modal
      svgName.select(`.annotation-text.${annotationId}`)
        .style("cursor", "pointer")
        .on("click", function (event) {
          event.stopPropagation();
          openAnnotationModal({
            title: "Edit horizontal line annotation",
            currentText: thisText,
            currentWrapWidth: wrapWidth,
            currentPosition: textPosition,
            showPosition: true,
            positionOptions: ["above", "below"],
            onApply: function (newValues) {
              thisText = newValues.text;
              textPosition = newValues.position;
              wrapWidth = newValues.wrapWidth;

              ({ y: TextOffsetY, anchor: textAnchor, wrap: centerWrap } = getTextPositionOffsets(textPosition, "horizontalLine"));

              const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

              allAnnotations[annotationIndex] = {
                ...allAnnotations[annotationIndex],
                label: thisText,
                text: {
                  ...allAnnotations[annotationIndex].text,
                  wrapWidth: wrapWidth,
                },
                position: {
                  ...allAnnotations[annotationIndex].position,
                  text: textPosition
                }
              };

              // Update the text
              svgName.select(`.annotation-text.${annotationId}`)
                .text(thisText)
                .attr('y', yValue + TextOffsetY)
                .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
            }
          });
        });
    }
  } else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      0, // TextOffsetX - no horizontal offset needed for horizontal line
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Draws a shaded rectangular range vertically between two x-values, with optional text annotation.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} height - Height of the range.
 * @param {number} xValue - Start X-coordinate of range.
 * @param {number} xEndValue - End X-coordinate of range.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'left' or 'right' text alignment.
 * @param {string} textPosition2 - 'inside' or 'outside' placement relative to range.
 * @param {number} [yValue=10] - Y-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 */
export function addAnnotationRangeVertical(svgName, height, xValue, xEndValue, thisText, textPosition = "left", textPosition2 = "inside", yValue = 10, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY, size, editable = false, id) {

  const annotationId = id || generateAnnotationId();

  const textStarts = { start: xValue, end: xEndValue }

  let { x: TextOffsetX, anchor: textAnchor, wrap: centerWrap, start: thisTextStart } = getTextPositionOffsetsForRange(textPosition, textPosition2, 'vertical');
  let textStart = textStarts[thisTextStart];


  svgName.append('rect')
    .attr('x', xValue)
    .attr('width', xEndValue - xValue)
    .attr('y', 0)
    .attr('height', height)
    .attr('class', `annotation annotation-range ${annotationId}`)
    //moves range rectangle behind other elements
    .lower();

  if (mobileText != true || size == "lg") {

    appendWrappedText(svgName, textStart + TextOffsetX, yValue, thisText, annotationId, textAnchor, wrapWidth, centerWrap)

    if (editable) {
      appendBaseMarker(svgName, xValue, yValue, annotationId)

      const tailHandle = svgName.append("circle")
        .attr("class", `annotation annotation-handle tail-handle ${annotationId}`)
        .attr("cx", xEndValue)
        .attr("cy", yValue)
        .attr("r", 3)
        .style("fill", "green")
        .style("stroke", "darkgreen")
      // .attr("r", 5)
      // .style("fill", "blue")
      // .style("cursor", "move")
      // .call(d3.drag()
      //   .on("drag", function (event) {
      //     xEndValue = event.x;
      //     updateVerticalRange();
      //   })
      // );

      svgName.select(`.annotation-text.${annotationId}`)
        .style("cursor", "pointer")
        .on("click", function (event) {
          event.stopPropagation();
          openAnnotationModal({
            title: "Edit horizontal range annotation",
            currentText: thisText,
            currentPosition: [textPosition, textPosition2],
            currentWrapWidth: wrapWidth,
            showPosition: true,
            positionOptions: [["left", "right"], ["inside", "outside"]],
            onApply: function (newValues) {
              thisText = newValues.text;
              [textPosition, textPosition2] = newValues.position;
              wrapWidth = newValues.wrapWidth;

              ({ x: TextOffsetX, anchor: textAnchor, wrap: centerWrap, start: thisTextStart } = getTextPositionOffsetsForRange(textPosition, textPosition2, 'vertical'));
              textStart = textStarts[thisTextStart];

              updateVerticalRange()

              // Update the text
              svgName.select(`.annotation-text.${annotationId}`)
                .text(thisText)
                .attr('x', textStart + TextOffsetX)
                .attr('y', yValue)
                .attr('text-anchor', textAnchor)
                .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
            }
          });
        });

      function updateVerticalRange() {
        svgName.select('rect')
          .attr('width', xEndValue - xValue)

        svgName.select(`.tail-handle.${annotationId}`)
          .attr('cx', xEndValue)

        const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

        allAnnotations[annotationIndex] = {
          ...allAnnotations[annotationIndex],
          label: thisText,
          text: {
            ...allAnnotations[annotationIndex].text,
            wrapWidth: wrapWidth,
          },
          line: {
            ...allAnnotations[annotationIndex].line,
            endX: xEndValue
          },
          position: {
            ...allAnnotations[annotationIndex].position,
            text: textPosition,
            enclosure: textPosition2
          }
        };
      }
    }

  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      yValue,
      TextOffsetX,
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Draws a shaded horizontal range between two y-values, with optional text annotation.
 * @param {Object} svgName - D3 SVG selection.
 * @param {number} width - Width of the range.
 * @param {number} yValue - Start Y-coordinate of range.
 * @param {number} yEndValue - End Y-coordinate of range.
 * @param {string} thisText - Annotation text.
 * @param {string} textPosition - 'above' or 'below' for text alignment.
 * @param {string} textPosition2 - 'inside' or 'outside' placement relative to range.
 * @param {number} [xValue=10] - X-coordinate for text.
 * @param {number} wrapWidth - Width for text wrapping.
 * @param {boolean} mobileText - Use mobile annotation alternative if true.
 * @param {*} mobileTextNumber - Identifier for mobile text version.
 * @param {*} MobileCircleOffsetX - Horizontal offset for mobile circle.
 * @param {*} MobileCircleOffsetY - Vertical offset for mobile circle.
 * @param {string} size - Chart size ('sm', 'md', 'lg').
 */
export function addAnnotationRangeHorizontal(svgName, width, yValue, yEndValue, thisText, textPosition = 'above', textPosition2 = 'inside', xValue, wrapWidth, mobileText, mobileTextNumber, MobileCircleOffsetX, MobileCircleOffsetY = 10, size, editable = false, id) {

  // let TextOffsetY, textAnchor, centerWrap, textStart;
  const annotationId = id || generateAnnotationId();

  if (!xValue) xValue = 10;

  const topY = Math.min(yValue, yEndValue);
  const bottomY = Math.max(yValue, yEndValue);
  const textStarts = { top: topY, bottom: bottomY }

  let { y: TextOffsetY, anchor: textAnchor, wrap: centerWrap, start: thisTextStart } = getTextPositionOffsetsForRange(textPosition, textPosition2, 'horizontal')
  const textStart = textStarts[thisTextStart]

  svgName.append('rect')
    .attr('x', 0)
    .attr('width', width)
    .attr('y', topY)
    .attr('height', Math.abs(yEndValue - yValue))
    .attr('class', `annotation annotation-range ${annotationId}`)
    .lower()

  if (mobileText != true || size == "lg") {
    appendWrappedText(svgName, xValue, textStart + TextOffsetY, thisText, annotationId, textAnchor, wrapWidth, centerWrap)

    if (editable) {
      appendBaseMarker(svgName, xValue, yValue, annotationId)

      const tailHandle = svgName.append("circle")
        .attr("class", `annotation annotation-handle tail-handle ${annotationId}`)
        .attr("cx", xValue)
        .attr("cy", yEndValue)
        .attr("r", 3)
        .style("fill", "green")
        .style("stroke", "darkgreen")
      // .style("cursor", "move")
      // .call(d3.drag()
      //   .on("drag", function (event) {
      //     yEndValue = event.y;
      //     updateHorizontalRange();
      //   })
      // );

      svgName.select(`.annotation-text.${annotationId}`)
        .style("cursor", "pointer")
        .on("click", function (event) {
          event.stopPropagation();
          openAnnotationModal({
            title: "Edit horizontal range annotation",
            currentText: thisText,
            currentPosition: [textPosition, textPosition2],
            currentWrapWidth: wrapWidth,
            showPosition: true,
            positionOptions: [["above", "below"], ["inside", "outside"]],
            onApply: function (newValues) {
              thisText = newValues.text;
              [textPosition, textPosition2] = newValues.position;
              wrapWidth = newValues.wrapWidth;

              ({ y: TextOffsetY, anchor: textAnchor, wrap: centerWrap, start: thisTextStart } = getTextPositionOffsetsForRange(textPosition, textPosition2, 'horizontal'))
              const textStart = textStarts[thisTextStart]

              updateHorizontalRange()

              // Update the text
              svgName.select(`.annotation-text.${annotationId}`)
                .text(thisText)
                .attr('x', xValue)
                .attr('y', textStart + TextOffsetY)
                .attr('text-anchor', textAnchor)
                .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
            }
          });
        });

      function updateHorizontalRange() {

        svgName.select('rect')
          .attr('y', Math.min(yValue, yEndValue))
          .attr('height', Math.abs(yEndValue - yValue))

        svgName.select(`.tail-handle.${annotationId}`)
          .attr('cy', yEndValue)

        const annotationIndex = allAnnotations.findIndex(item => item.id === annotationId);

        allAnnotations[annotationIndex] = {
          ...allAnnotations[annotationIndex],
          label: thisText,
          text: {
            ...allAnnotations[annotationIndex].text,
            wrapWidth: wrapWidth,
          },
          line: {
            ...allAnnotations[annotationIndex].line,
            endY: yEndValue
          },
          position: {
            ...allAnnotations[annotationIndex].position,
            alignment: textPosition,
            enclosure: textPosition2
          }
        };
      }
    }

  }
  else {
    annotationMobileAlternative(
      svgName,
      xValue,
      textStart,
      0, // TextOffsetX - no horizontal offset needed
      MobileCircleOffsetX,
      MobileCircleOffsetY,
      mobileTextNumber,
      wrapWidth,
      thisText,
      wrap2,
      centerWrap
    );
  }
}

/**
 * Simplified annotation function for common use cases
 * @param {Object} svg - D3 SVG selection
 * @param {string} type - Annotation type
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} label - Annotation text
 * @param {Object} [options={}] - Additional options
 */
export function addSimpleAnnotation(svg, type, x, y, label, options = {}) {
  return addAnnotation({
    svg,
    type,
    x,
    y,
    label,
    ...options
  });
}

/**
 * Universal annotation function that handles all types of annotations
 * @param {Object} config - Configuration object with all annotation parameters
 * @param {Object} config.svg - D3 SVG selection
 * @param {string} config.type - Type: 'arrow', 'text', 'line-vertical', 'line-horizontal', 'range-vertical', 'range-horizontal', 'direction-arrow', 'elbow-arrow'
 * @param {number} config.x - Primary X coordinate
 * @param {number} config.y - Primary Y coordinate 
 * @param {string} config.label - Annotation text
 * @param {Object} [config.position] - Position settings
 * @param {string} [config.position.text] - Text position: 'above', 'below', 'left', 'right', 'center', 'start', 'end'
 * @param {string} [config.position.anchor] - Anchor for arrows: 'start', 'end'
 * @param {string} [config.position.alignment] - Alignment for direction arrows: 'above', 'below', 'left', 'right'
 * @param {string} [config.position.inside] - For ranges: 'inside', 'outside'
 * @param {Object} [config.arrow] - Arrow-specific settings
 * @param {number} [config.arrow.offsetX] - Arrow X offset
 * @param {number} [config.arrow.offsetY] - Arrow Y offset
 * @param {number} [config.arrow.lengthX] - Arrow X length
 * @param {number} [config.arrow.lengthY] - Arrow Y length
 * @param {string} [config.arrow.curve] - Curve direction: 'left', 'right'
 * @param {string} [config.arrow.direction] - Direction arrow: 'up', 'down', 'left', 'right'
 * @param {Object} [config.line] - Line/range settings
 * @param {number} [config.line.width] - Width for horizontal lines/ranges
 * @param {number} [config.line.height] - Height for vertical lines/ranges
 * @param {number} [config.line.endX] - End X for vertical ranges
 * @param {number} [config.line.endY] - End Y for horizontal ranges
 * @param {boolean} [config.line.moveToBack] - Move line behind other elements
 * @param {Object} [config.text] - Text settings
 * @param {number} [config.text.wrapWidth] - Text wrap width
 * @param {string} [config.text.verticalAlign] - Vertical alignment: 'top', 'middle', 'bottom' for Elbow and Direction arrows.
 * @param {Object} [config.mobile] - Mobile settings
 * @param {boolean} [config.mobile.enabled] - Use mobile alternative
 * @param {string|number} [config.mobile.number] - Mobile text number
 * @param {number} [config.mobile.circleOffsetX] - Mobile circle X offset
 * @param {number} [config.mobile.circleOffsetY] - Mobile circle Y offset
 * @param {Object} [config.style] - Style settings
 * @param {string} [config.style.color] - Arrow/line color
 * @param {string} [config.style.size] - Chart size: 'sm', 'md', 'lg'
 * @param {string} [config.editable] - Boolean to be able to edit the annotation
 */
export function addAnnotation(config) {
  const {
    svg,
    type,
    x,
    y,
    label = '',
    position = {},
    arrow = {},
    line = {},
    text = {},
    mobile = {},
    style = {},
    editable = false,
    id = null
  } = config;

  // Default values
  const defaults = {
    position: {
      text: 'right',
      anchor: 'end',
      alignment: 'above',
      enclosure: 'outside'
    },
    arrow: {
      offsetX: 0,
      offsetY: 0,
      lengthX: 0,
      lengthY: 0,
      curve: 'right',
      direction: 'right',
    },
    line: {
      width: 100,
      height: 100,
      moveToBack: false,
      endX: "",
      endY: ""
    },
    text: {
      wrapWidth: 150,
      verticalAlign: 'middle'
    },
    mobile: {
      enabled: false,
      number: 1,
      circleOffsetX: 0,
      circleOffsetY: 0
    },
    style: {
      color: '#414042',
      size: 'md'
    },
  };

  // Merge with defaults
  const pos = { ...defaults.position, ...position };
  const arr = { ...defaults.arrow, ...arrow };
  const ln = { ...defaults.line, ...line };
  const txt = { ...defaults.text, ...text };
  const mob = { ...defaults.mobile, ...mobile };
  const sty = { ...defaults.style, ...style };

  // Route to appropriate function based on type
  switch (type) {
    case 'arrow':
      return addAnnotationArrow(
        svg, x, y, arr.offsetX, arr.offsetY, arr.lengthX, arr.lengthY,
        arr.curve, label, pos.text, txt.wrapWidth, mob.enabled,
        mob.number, mob.circleOffsetX, mob.circleOffsetY, sty.size, editable, id
      );

    case 'text':
      return addAnnotationText(
        svg, x, y, arr.offsetX || 0, arr.offsetY || 0, label,
        pos.text === 'left' ? 'end' : pos.text === 'right' ? 'start' : 'middle',
        txt.wrapWidth, mob.enabled, mob.number, mob.circleOffsetX,
        mob.circleOffsetY, sty.size, editable, id
      );

    case 'line-vertical':
      return addAnnotationLineVertical(
        svg, ln.height, x, label, pos.text, y || 10, txt.wrapWidth,
        mob.enabled, mob.number, mob.circleOffsetX, mob.circleOffsetY,
        ln.moveToBack, sty.size, editable, id
      );

    case 'line-horizontal':
      return addAnnotationLineHorizontal(
        svg, ln.width, y, label, pos.text, x || 10, txt.wrapWidth,
        mob.enabled, mob.number, mob.circleOffsetX, mob.circleOffsetY,
        ln.moveToBack, sty.size, editable, id
      );

    case 'range-vertical':
      return addAnnotationRangeVertical(
        svg, ln.height, x, ln.endX, label, pos.text, pos.enclosure,
        y || 10, txt.wrapWidth, mob.enabled, mob.number,
        mob.circleOffsetX, mob.circleOffsetY, sty.size, editable, id
      );

    case 'range-horizontal':
      return addAnnotationRangeHorizontal(
        svg, ln.width, y, ln.endY, label, pos.alignment, pos.enclosure,
        x || 10, txt.wrapWidth, mob.enabled, mob.number,
        mob.circleOffsetX, mob.circleOffsetY, sty.size, editable, id
      );

    case 'direction-arrow':
      return addDirectionArrow(
        svg, arr.direction, pos.anchor, x, y, label,
        txt.wrapWidth, txt.verticalAlign, sty.color, editable, id
      );

    default:
      console.warn(`Unknown annotation type: ${type}`);
      return;
  }
}

export function createAnnotationToolbar(wholeSvg, chartContainer, scales, margin, chart_width, chart_height) {
  setupAnnotationToolbar()

  setupArrowhead(chartContainer)

  const annotationsNames = [
    {
      label: "Text",
      name: "text",
      inputsNeeded: [
        { name: "label", default: "Text annotation" }
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-baseline-icon lucide-baseline"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>'
    }, {
      label: "Arrow",
      name: "arrow",
      inputsNeeded: [
        { name: "label", default: "Arrow" },
        { name: "arrow", default: { offsetX: 10, offsetY: 10, lengthX: 50, lengthY: 25 } },
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-redo-icon lucide-redo"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>'
    }, {
      label: "Direction arrow",
      name: "direction-arrow",
      inputsNeeded: [
        { name: "arrow", default: { direction: "right" } },
        { name: "position", default: { anchor: "start" } },
        { name: "label", default: "Direction-arrow" },
        { name: "text", default: { verticalAlign: "middle" } }
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-to-line-icon lucide-arrow-right-to-line"><path d="M17 12H3"/><path d="m11 18 6-6-6-6"/><path d="M21 5v14"/></svg>'
    }, {
      label: "Horizontal line",
      name: "line-horizontal",
      inputsNeeded: [
        { name: "label", default: "Horizontal line" },
        { name: "line", default: { width: chart_width } },
        { name: "position", default: { text: "above" } }
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>'
    }, {
      label: "Vertical line",
      name: "line-vertical",
      inputsNeeded: [
        { name: "label", default: "Vertical line" },
        { name: "line", default: { height: chart_height } }
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>'
    }, {
      label: "Horizontal range",
      name: "range-horizontal",
      inputsNeeded: [
        { name: "label", default: "Horizontal range" },
        { name: "line", default: { width: chart_width } },
        { name: "position", default: { alignment: "above", enclosure: "inside" } },
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-vertical-icon lucide-gallery-vertical"><path d="M3 2h18"/><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M3 22h18"/></svg>'
    },
    {
      label: "Vertical Range",
      name: "range-vertical",
      inputsNeeded: [
        { name: "label", default: "Vertical range" },
        { name: "line", default: { height: chart_height } },
        { name: "position", default: { text: "left", enclosure: "inside" } },
      ],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-horizontal-icon lucide-gallery-horizontal"><path d="M2 3v18"/><rect width="12" height="18" x="6" y="3" rx="2"/><path d="M22 3v18"/></svg>'
    }
  ]

  const fieldset = d3.select("#annotation-toolbar").append("fieldset")

  fieldset.append('legend')
    .text("Select a type of annotation to add")

  const grid = fieldset.append('div').attr('class', 'options-grid')

  const inputs = grid.selectAll('div').data(annotationsNames).enter().append('div')

  inputs.append('input').attr('type', 'radio').attr('id', d => d.name).attr('name', 'annotationTypes').attr('value', d => d.name).property('checked', (d, i) => i == 0 ? true : false).attr('class', 'sr-only')
  const label = inputs.append('label').attr('class', 'option-card').attr('for', d => d.name)
  label.append('span').text(d => d.label)
  label.append('div').attr('class', 'option-icon').html(d => d.icon)

  const annotationControlPanel = d3.select('#annotation-control-panel')
  const annotationList = annotationControlPanel.append("div").attr('id', 'annotationList')

  const button = d3.select("#annotation-toolbar")
    .append("button")
    .attr("id", "clicktoadd")
    .attr('class','ons-btn')
    .on("click", function () {
      createClickDataRecorder(wholeSvg, scales, margin, (record) => {
        let selectedValue = d3.select('input[name="annotationTypes"]:checked').property('value');
        const annotationId = generateAnnotationId();
        const typeDefaults = annotationsNames.find(d => d.name === selectedValue);

        const annotationOptions = {
          svg: chartContainer,
          type: selectedValue,
          editable: true,
          x: record.pixel.x,
          y: record.pixel.y,
          ...Object.fromEntries(typeDefaults.inputsNeeded.map(d => [d.name, d.default]))
        };

        if (selectedValue == 'range-horizontal') {
          annotationOptions.line.endY = annotationOptions.y + 50
        } else if (selectedValue == 'range-vertical') {
          annotationOptions.line.endX = annotationOptions.x + 150
        }

        allAnnotations.push({ ...record, ...annotationOptions, line: { ...annotationOptions.line }, id: annotationId });

        renderAnnotationList(allAnnotations)
        renderAllAnnotations(allAnnotations)
      })
    });

  button.append('span').attr('class','ons-btn__inner').append('span').attr('class','ons-btn__text-link').text("Click to place annotation with mouse")  

  function renderAnnotationList(allAnnotations) {
    annotationList.html("")

    allAnnotations.forEach((annotation, index) => {
      const item = annotationList
        .append("div")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("padding", "4px")
        .style("border-bottom", "1px solid #ccc");

      // Annotation label
      item.append("span")
        .text(`${index + 1}: ${annotation.type} @ (${annotation.x | 0}, ${annotation.y | 0})`);

      // Buttons container
      const buttons = item.append("div");

      buttons.append("button")
        .text("Reposition with click")
        .style("margin-right", "5px")
        .on("click", () => repositionWithClickById(annotation.id))

      // Edit button
      buttons.append("button")
        .text("Edit position")
        .style("margin-right", "5px")
        .on("click", () => editAnnotationPosition(annotation.id, item));

      // Remove button
      buttons.append("button")
        .text("Remove annotation")
        .on("click", () => removeAnnotationById(annotation.id));
    })

    const saveButton = annotationList.append("div").style('margin-top','0.5rem')
      .append("button").attr('class','ons-btn')
      .on("click", () => downloadJsonFile(allAnnotations, `annotations-${Date.now()}.json`))

    saveButton.append('span').attr('class','ons-btn__inner').append('span').attr('class','ons-btn__text-link').text("Save all annotations")
  }

  function repositionWithClickById(id) {
    createClickDataRecorder(wholeSvg, scales, margin, (record) => {
      let thisAnnotation = allAnnotations[allAnnotations.findIndex(item => item.id === id)];
      thisAnnotation.pixel = record.pixel
      thisAnnotation.data = record.data
      thisAnnotation.x = record.pixel.x
      thisAnnotation.y = record.pixel.y
      renderAnnotationList(allAnnotations)
      renderAnnotationById(thisAnnotation.id)
    })
  }

  function renderAnnotationById(id) {
    let thisAnnotation = allAnnotations[allAnnotations.findIndex(item => item.id === id)];
    chartContainer.selectAll(`.${id}`).remove()
    addAnnotation(thisAnnotation, id)
  }

  function editAnnotationPosition(id, item) {
    const index = allAnnotations.findIndex(item => item.id === id)
    const anno = allAnnotations[index]

    const form = item.append("div")
      .attr("class", "edit-position-form")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("margin-top", "5px");

    // Data X
    form.append("label").text("Data X: ");
    const dataXInput = form.append("input")
      .property("value", anno.data.x)
      .on("input", function () {
        const val = sensibleNumber(this.value);
        anno.data.x = val;
        anno.pixel.x = val
        anno.x = scales.xScale(val);
        pixelXInput.property("value", anno.x);
      });

    form.append("br");

    // Data Y
    form.append("label").text("Data Y: ");
    const dataYInput = form.append("input")
      .property("value", anno.data.y)
      .on("input", function () {
        const val = sensibleNumber(this.value);
        anno.data.y = val;
        anno.pixel.y = val;
        anno.y = scales.yScale(val);
        pixelYInput.property("value", anno.y);
      });

    form.append("br");

    // Pixel X
    form.append("label").text("Pixel X: ");
    const pixelXInput = form.append("input")
      .property("value", anno.x)
      .on("input", function () {
        const val = sensibleNumber(this.value);
        anno.x = val;
        anno.pixel.x = val;
        anno.data.x = invertScale(scales.xScale, val);
        dataXInput.property("value", anno.data.x);
      });

    form.append("br");

    // Pixel Y
    form.append("label").text("Pixel Y: ");
    const pixelYInput = form.append("input")
      .property("value", anno.y)
      .on("input", function () {
        const val = sensibleNumber(this.value);
        anno.y = val;
        anno.pixel.y = val;
        anno.dataY = invertScale(scales.yScale, val);
        dataYInput.property("value", anno.data.y);
      });

    form.append("br");

    //vertical range, endX
    if (anno.type === 'range-vertical') {
      // Data endX
      form.append("label").text("Data endX: ");
      const dataEndXInput = form.append("input")
        .property("value", invertScale(scales.xScale, anno.line.endX))
        .on("input", function () {
          const val = sensibleNumber(this.value);
          anno.data.endX = val;
          // anno.pixel.endX = val;
          anno.line.endX = scales.xScale(val);
          pixelEndXInput.property("value", anno.line.endX);
        });

      form.append("br");

      // Pixel endX
      form.append("label").text("Pixel endX: ");
      const pixelEndXInput = form.append("input")
        .property("value", anno.line.endX)
        .on("input", function () {
          const val = sensibleNumber(this.value);
          anno.line.endX = val;
          // anno.pixel.endX = val;
          anno.data.endX = invertScale(scales.xScale, val);
          dataEndXInput.property("value", anno.data.endX);
        });

      form.append("br");
    }

    //vertical range, endY
    if (anno.type === 'range-horizontal') {
      form.append("label").text("Data endY: ");
      const dataEndYInput = form.append("input")
        .property("value", invertScale(scales.yScale, anno.line.endY))
        .on("input", function () {
          const val = sensibleNumber(this.value);
          anno.data.endY = val;
          // anno.pixel.endY = val;
          anno.line.endY = scales.yScale(val);
          pixelEndYInput.property("value", anno.line.endY);
        });

      form.append("br");

      form.append("label").text("Pixel endY: ");
      const pixelEndYInput = form.append("input")
        .property("value", anno.line.endY)
        .on("input", function () {
          const val = sensibleNumber(this.value);
          anno.line.endY = val;
          // anno.pixel.endY = val;
          anno.data.endY = invertScale(scales.yScale, val);
          dataEndYInput.property("value", anno.data.endY);
        });

      form.append("br");
    }


    // Save button
    form.append("button")
      .text("Save position")
      .on("click", () => {
        allAnnotations[index] = anno;
        renderAnnotationList(allAnnotations);
        renderAnnotationById(id);
        form.remove();
      });
  }

  function removeAnnotationById(id) {
    chartContainer.selectAll(`.${id}`).remove()
    const index = allAnnotations.findIndex(item => item.id === id);
    if (index > -1) {
      allAnnotations.splice(index, 1);
    }
    renderAnnotationList(allAnnotations)
  }

  function renderAllAnnotations(allAnnotations) {
    // remove all annotations
    wholeSvg.selectAll(".annotation").remove()
    allAnnotations.forEach(anno => addAnnotation(anno, anno.id))
  }

  // if a string, leave as a string, if a number, make it a number
  function sensibleNumber(value) {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && isFinite(parsedValue)) {
      return parsedValue;
    }
    return value;
  }

  function downloadJsonFile(array, filename = 'data.json') {
    // Step 1: Convert the array to a JSON string
    const jsonString = JSON.stringify(array, null, 2);

    // Step 2: Create a downloadable file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

}

function createClickDataRecorder(svgContainer, scales, margin, callback) {
  const { xScale, yScale } = scales;
  svgContainer.style("cursor", "crosshair");


  svgContainer.on('click', function (event) {
    const [x, y] = d3.pointer(event, this);

    const xDataValue = invertScale(xScale, x - margin.left)
    const yDataValue = invertScale(yScale, y - margin.top)

    const dataRecord = { timestamp: new Date(), pixel: { x: x - margin.left, y: y - margin.top }, data: { x: xDataValue, y: yDataValue } }

    if (callback && typeof callback === 'function') {
      callback(dataRecord);
    }
    svgContainer.style("cursor", null);
    svgContainer.on('click', null);
  })
  return
}

function invertScale(scale, pixel) {
  if (typeof scale.invert === "function") {
    // Continuous scales (linear, time, log, etc.)
    return scale.invert(pixel);
  } else if (scale.bandwidth) {
    // Band scale: find the closest category
    const domain = scale.domain();
    const range = domain.map(d => {
      const center = scale(d) + scale.bandwidth() / 2;
      return { value: d, center };
    });
    let closest = domain[0];
    let minDist = Infinity;
    for (const { value, center } of range) {
      const dist = Math.abs(center - pixel);
      if (dist < minDist) {
        minDist = dist;
        closest = value;
      }
    }
    return closest;
  } else {
    throw new Error("Unsupported scale type");
  }
}

/**
* Loads a JSON file from a given path and returns the parsed data.
*
* @param {string} filePath - The path to the JSON file.
* @param {string} svgForChart - the svg g element for the chart
* @returns {Promise<any>} A promise that resolves with the parsed JSON data.
*/
export async function loadAnnotationsFromJson(filePath, svgForChart, scales, isMobile = false) {
  try {
    const response = await d3.json(filePath);

    let mobileAnnotationsCounter = 1;

    setupMobileAnnotations()

    removeAllAnnotations()

    for (let anno of response) {
      if (anno.type !== 'direction-arrow') {
        anno.mobile = { enabled: isMobile, number: mobileAnnotationsCounter };
        mobileAnnotationsCounter += 1;
      } else {
        anno.mobile = {};
      }

      anno.x = scales.xScale(anno.data.x)
      anno.y = scales.yScale(anno.data.y)
      if (anno.type == 'range-vertical' && anno.data.endX) {
        anno.line.endX = scales.xScale(anno.data.endX)
      }

      if (anno.type == 'range-horizontal' && anno.data.endY) {
        anno.line.endY = scales.yScale(anno.data.endY)
      }

      anno.svg = svgForChart;
      anno.editable = false;

      // This works because `anno` is a reference to the object in the `response` array
      addAnnotation(anno);
    }

    // Return the parsed data.
    return response;

  } catch (error) {
    // Log any errors that occurred during the fetch or parsing process.
    console.error("Failed to load JSON file:", error);
    // Re-throw the error so it can be handled by the calling function.
    throw error;
  }
}

function removeAllAnnotations() {
  d3.selectAll('.annotation').remove()
}

//End annotations

export function addElbowArrow(svgName,
  startX, startY,
  endX, endY,
  bendDirection, // 'horizontal-first' or 'vertical-first'
  arrowAnchor, // 'start' or 'end' - where the arrowhead appears
  thisText,
  wrapWidth,
  textAdjustY = 0,
  wrapVerticalAlign = "middle",
  arrowColour = "#414042",
  textAlignment = "center", editable = false) { // 'start', 'center', 'end' - where text appears on the line

  let centerWrap, arrowPadding, textAnchor, TextOffsetX, textPadding, TextOffsetY, TextOffsetAdjustY, arrowFillColour;
  const annotationId = `annotation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  let bendX, bendY, pathString, textX, textY;

  centerWrap = wrapVerticalAlign;
  arrowPadding = 5;
  textAnchor = 'middle';
  TextOffsetX = 0;
  textPadding = 5;
  TextOffsetY = 5;
  TextOffsetAdjustY = textAdjustY;
  arrowFillColour = arrowColour;

  // Calculate bend point based on bend direction
  if (bendDirection === 'horizontal-first') {
    bendX = endX;
    bendY = startY;
  } else { // vertical-first
    bendX = startX;
    bendY = endY;
  }

  // Determine arrow direction and create arrowhead coordinates
  let arrowSize = 6;
  let arrowX, arrowY, finalDirection;

  if (arrowAnchor === 'end') {
    arrowX = endX;
    arrowY = endY;
    if (bendDirection === 'horizontal-first') {
      // Final segment is vertical: from bendPoint to end
      finalDirection = endY > bendY ? 'down' : 'up';
    } else {
      // Final segment is horizontal: from bendPoint to end
      finalDirection = endX > bendX ? 'right' : 'left';
    }
  } else {
    arrowX = startX;
    arrowY = startY;
    if (bendDirection === 'vertical-first') {
      // First segment is vertical: from start to bendPoint
      // Arrow points opposite to segment direction
      finalDirection = bendY > startY ? 'up' : 'down';
    } else {
      // First segment is horizontal: from start to bendPoint
      // Arrow points opposite to segment direction
      finalDirection = bendX > startX ? 'left' : 'right';
    }
  }

  // Create arrowhead points based on direction
  let arrowPoint1X, arrowPoint1Y, arrowPoint2X, arrowPoint2Y;

  if (finalDirection === 'up') {
    arrowPoint1X = arrowX - arrowSize;
    arrowPoint1Y = arrowY + arrowSize;
    arrowPoint2X = arrowX + arrowSize;
    arrowPoint2Y = arrowY + arrowSize;
  } else if (finalDirection === 'down') {
    arrowPoint1X = arrowX - arrowSize;
    arrowPoint1Y = arrowY - arrowSize;
    arrowPoint2X = arrowX + arrowSize;
    arrowPoint2Y = arrowY - arrowSize;
  } else if (finalDirection === 'left') {
    arrowPoint1X = arrowX + arrowSize;
    arrowPoint1Y = arrowY - arrowSize;
    arrowPoint2X = arrowX + arrowSize;
    arrowPoint2Y = arrowY + arrowSize;
  } else { // right
    arrowPoint1X = arrowX - arrowSize;
    arrowPoint1Y = arrowY - arrowSize;
    arrowPoint2X = arrowX - arrowSize;
    arrowPoint2Y = arrowY + arrowSize;
  }

  // Create the complete path with elbow and arrowhead
  pathString = `M${startX},${startY} L${bendX},${bendY} L${endX},${endY} M${arrowX},${arrowY} L${arrowPoint1X},${arrowPoint1Y} M${arrowX},${arrowY} L${arrowPoint2X},${arrowPoint2Y}`;

  // Calculate text position based on textAlignment
  if (textAlignment === 'start') {
    textX = startX;
    textY = startY;
  } else if (textAlignment === 'end') {
    textX = endX;
    textY = endY;
  } else { // center - position at the bend point
    textX = bendX;
    textY = bendY;
  }

  // Adjust text anchor based on line direction at text position
  if (textAlignment === 'center') {
    textAnchor = 'middle';
    TextOffsetX = 0;
    TextOffsetY = -textPadding;
  } else if (textAlignment === 'start') {
    if (bendDirection === 'horizontal-first') {
      textAnchor = endX > startX ? 'start' : 'end';
      TextOffsetX = endX > startX ? textPadding : -textPadding;
    } else {
      textAnchor = 'middle';
      TextOffsetX = 0;
      TextOffsetY = endY > startY ? textPadding : -textPadding;
    }
  } else { // end
    if (bendDirection === 'horizontal-first') {
      textAnchor = 'middle';
      TextOffsetX = 0;
      TextOffsetY = endY > bendY ? textPadding : -textPadding;
    } else {
      textAnchor = endX > bendX ? 'start' : 'end';
      TextOffsetX = endX > bendX ? textPadding : -textPadding;
    }
  }

  // Draw the complete elbow path with arrowhead
  svgName.append('path')
    .attr("d", pathString)
    .attr("class", `elbow-arrow ${annotationId}`)
    .attr("stroke", arrowFillColour)
    .attr("fill", "none")
    .attr("stroke-width", 1.5);

  // Add text
  if (thisText) {
    svgName.append('text')
      .attr('x', textX + TextOffsetX)
      .attr('y', textY + TextOffsetY + TextOffsetAdjustY)
      .attr('class', `annotation-text ${annotationId}`)
      .text(thisText)
      .attr('text-anchor', textAnchor)
      .call(wrap2, wrapWidth, 0.35, 1.1, 1, true, centerWrap);
  }
}

// Voronoi functions
/**
 * Creates an interactive Voronoi/Delaunay overlay for scatter plots,
 * enabling mouse and keyboard interaction with tooltips.
 * @param {Object} params
 * @param {Object} params.svgContainer - D3 SVG selection.
 * @param {Array} params.data - Data points [{xvalue, yvalue, group, name}].
 * @param {number} params.chartWidth - Chart width in pixels.
 * @param {number} params.height - Chart height in pixels.
 * @param {function} params.xScale - D3 x-axis scale.
 * @param {function} params.yScale - D3 y-axis scale.
 * @param {Object} [params.tooltipConfig] - Optional tooltip settings.
 * @param {*} params.shape - Shape function for points.
 * @param {function} param.sizeScale - D3 size scale
 * @param {string} param.sizeField - column name in the data for size
 * @param {function} param.getSymbolSize - function to return size of symbol given data
 * @param {number} [params.radius=30] - Interaction radius in pixels.
 * @param {Object} params.margin - Chart margins {top, right, bottom, left}.
 * @returns {Object} Methods for managing overlay: cleanup(), highlightPoint(), clearHighlight().
 */
export function createDelaunayOverlay({
  svgContainer,
  data,
  chartWidth,
  height,
  xScale,
  yScale,
  tooltipConfig = {},
  shape,
  sizeScale,
  sizeField,
  getSymbolSize,
  radius = 30,
  margin,
  multiHighlight = false,
}) {
  const config = createTooltipConfig(tooltipConfig, margin, sizeScale, sizeField);
  const delaunay = createDelaunayTriangulation(data, xScale, yScale);
  const tooltip = createTooltip(config);
  const state = createInteractionState();

  setupSVGForKeyboardNavigation(svgContainer);
  const overlay = createInteractionOverlay(svgContainer, chartWidth, height);

  // Setup all event handlers
  setupMouseHandlers(
    overlay,
    delaunay,
    data,
    xScale,
    yScale,
    tooltip,
    config,
    state,
    shape,
    getSymbolSize,
    sizeScale,
    radius,
    svgContainer,
    multiHighlight
  );
  setupKeyboardHandlers(
    svgContainer,
    data,
    xScale,
    yScale,
    tooltip,
    config,
    state,
    shape,
    getSymbolSize,
    sizeScale
  );

  return {
    cleanup: createCleanupFunction(tooltip, overlay, svgContainer, state),
    highlightPoint: (pointIndex) =>
      highlightPointByIndex(
        pointIndex,
        data,
        svgContainer,
        xScale,
        yScale,
        tooltip,
        config,
        state,
        shape,
        getSymbolSize,
        sizeScale
      ),
    clearHighlight: () =>
      clearHighlightAndDropdownMode(tooltip, svgContainer, state),
    highlightAll: (pointIndex) => {
      if (pointIndex >= 0 && pointIndex < data.length) {
        const point = data[pointIndex];
        updateHighlightAll(svgContainer, point, state);
      }
    },
  };
}

// Create tooltip configuration with defaults
function createTooltipConfig(tooltipConfig, margin, sizeScale, sizeField) {
  const defaultConfig = {
    xValueFormat: d3.format(".2f"),
    yValueFormat: d3.format(".2f"),
    sizeValueFormat: d3.format(".1f"),
    xLabel: "X",
    yLabel: "Y",
    sizeLabel: "Size",
    groupLabel: "Group",
    showXValue: true,
    showYValue: true,
    showGroup: sizeScale ? false : true,
    showSize: sizeScale ? true : false,
    sizeField: sizeField || null,
    backgroundColor: "#F5F5F6",
    textColor: "#222222",
    borderRadius: "4px",
    padding: "8px 12px 10px 12px",
    fontSize: "14px",
    width: "200px",
    offset: { x: 10, y: -10 },
    margin: margin || { top: 0, bottom: 0, left: 0, right: 0 },
  };

  return { ...defaultConfig, ...tooltipConfig };
}

// Create Delaunay triangulation
function createDelaunayTriangulation(data, xScale, yScale) {
  return d3.Delaunay.from(
    data,
    (d) => xScale(d.xvalue),
    (d) => yScale(d.yvalue)
  );
}

// Create tooltip element
function createTooltip(config) {
  return d3
    .select("#graphic")
    .append("div")
    .attr("class", "scatter-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", config.backgroundColor)
    .style("color", config.textColor)
    .style("border-radius", config.borderRadius)
    .style("padding", config.padding)
    .style("font-size", config.fontSize)
    .style("width", config.width)
    .style("word-wrap", "break-word")
    .style("white-space", "normal")
    .style("pointer-events", "none")
    .style("z-index", "1")
    .style("box-shadow", "box-shadow: 0 0 4px 1px rgba(136, 136, 136, 0.25)");
}

// Create interaction state object
function createInteractionState() {
  return {
    currentHighlight: null,
    keyboardIndex: 0,
    isKeyboardMode: false,
    isDropdownMode: false,
  };
}

// Setup SVG for keyboard navigation
function setupSVGForKeyboardNavigation(svgContainer) {
  const svgElement = svgContainer.node().parentNode;
  d3.select(svgElement).attr("tabindex", 0).style("outline", "none");
}

// Create invisible overlay for mouse events
function createInteractionOverlay(svgContainer, chartWidth, height) {
  return svgContainer
    .append("rect")
    .attr("class", "delaunay-overlay")
    .attr("width", chartWidth)
    .attr("height", height)
    .attr("fill", "transparent");
}

// Setup mouse event handlers
function setupMouseHandlers(
  overlay,
  delaunay,
  data,
  xScale,
  yScale,
  tooltip,
  config,
  state,
  shape,
  getSymbolSize,
  sizeScale,
  radius,
  svgContainer,
  multiHighlight
) {
  overlay.on("mousemove", function (event) {
    if (state.isKeyboardMode || state.isDropdownMode) return;

    const [mouseX, mouseY] = d3.pointer(event, this);
    const nearestIndex = delaunay.find(mouseX, mouseY);
    const nearestPoint = data[nearestIndex];

    // Check if point is within radius
    const distance = Math.hypot(
      mouseX - xScale(nearestPoint.xvalue),
      mouseY - yScale(nearestPoint.yvalue)
    );

    if (distance > radius) {
      hideTooltipAndHighlight(tooltip, svgContainer, state);
      return;
    }

    if (state.currentHighlight !== nearestIndex) {
      state.currentHighlight = nearestIndex;
      multiHighlight
        ? updateHighlightAll(svgContainer, nearestPoint, state)
        : updateHighlight(
            svgContainer,
            nearestPoint,
            xScale,
            yScale,
            shape,
            getSymbolSize,
            sizeScale
          );
      updateTooltip(tooltip, nearestPoint, config);
    }

    positionTooltip(
      tooltip,
      svgContainer,
      xScale(nearestPoint.xvalue),
      yScale(nearestPoint.yvalue),
      config
    );
  });

  overlay.on("mouseleave", function () {
    if (!state.isDropdownMode) {
      hideTooltipAndHighlight(tooltip, svgContainer, state);
    }
  });
}

// Setup keyboard event handlers
function setupKeyboardHandlers(
  svgContainer,
  data,
  xScale,
  yScale,
  tooltip,
  config,
  state,
  shape,
  getSymbolSize,
  sizeScale
) {
  const svgElement = svgContainer.node().parentNode;

  d3.select(svgElement).on("keydown", function (event) {
    if (state.isDropdownMode) return; // Disable keyboard navigation in dropdown mode

    if (event.key !== "Tab") {
      event.preventDefault();
    }
    state.isKeyboardMode = true;

    const totalPoints = data.length;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        state.keyboardIndex = (state.keyboardIndex + 1) % totalPoints;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        state.keyboardIndex =
          (state.keyboardIndex - 1 + totalPoints) % totalPoints;
        break;
      case "Home":
        state.keyboardIndex = 0;
        break;
      case "End":
        state.keyboardIndex = totalPoints - 1;
        break;
      case "Escape":
        hideTooltipAndHighlight(tooltip, svgContainer, state);
        state.isKeyboardMode = false;
        return;
      case "Tab":
        hideTooltipAndHighlight(tooltip, svgContainer, state);
        state.isKeyboardMode = false;
        return; // Don't prevent default, allow normal tab navigation
      default:
        return;
    }

    handleKeyboardNavigation(
      svgContainer,
      data,
      xScale,
      yScale,
      tooltip,
      config,
      state,
      shape,
      getSymbolSize,
      sizeScale
    );
  });

  d3.select(svgElement).on("focus", function () {
    if (!state.isKeyboardMode && data.length > 0) {
      state.keyboardIndex = 0;
      state.isKeyboardMode = true;
      handleKeyboardNavigation(
        svgContainer,
        data,
        xScale,
        yScale,
        tooltip,
        config,
        state,
        shape,
        getSymbolSize,
        sizeScale
      );
    }
  });

  d3.select(svgElement).on("blur", function () {
    if (state.isKeyboardMode) {
      hideTooltipAndHighlight(tooltip, svgContainer, state);
      state.isKeyboardMode = false;
    }
  });
}

// Handle keyboard navigation updates
function handleKeyboardNavigation(
  svgContainer,
  data,
  xScale,
  yScale,
  tooltip,
  config,
  state,
  shape,
  getSymbolSize,
  sizeScale
) {
  const selectedPoint = data[state.keyboardIndex];
  state.currentHighlight = state.keyboardIndex;

  updateHighlight(
    svgContainer,
    selectedPoint,
    xScale,
    yScale,
    shape,
    getSymbolSize,
    sizeScale
  );
  updateTooltip(tooltip, selectedPoint, config);
  positionTooltip(
    tooltip,
    svgContainer,
    xScale(selectedPoint.xvalue),
    yScale(selectedPoint.yvalue),
    config
  );
}

// Update point highlight
function updateHighlight(
  svgContainer,
  point,
  xScale,
  yScale,
  shape,
  getSymbolSize,
  sizeScale
) {
  svgContainer.selectAll(".point-highlight").remove();

  const symbolSize = getSymbolSize(point);
  svgContainer
    .append("path")
    .attr("class", "point-highlight")
    .attr("d", () => {
      if (sizeScale) {
        return d3
          .symbol()
          .type(d3.symbolCircle)
          .size(symbolSize + 50)();
      }

      switch (shape(point.group)) {
        case "circle":
          return d3
            .symbol()
            .type(d3.symbolCircle)
            .size(symbolSize + 50)();
        case "square":
          return d3
            .symbol()
            .type(d3.symbolSquare)
            .size(symbolSize + 50)();
        case "triangle":
          return d3
            .symbol()
            .type(d3.symbolTriangle)
            .size(symbolSize + 50)();
        case "diamond":
          return diamondShape((symbolSize + 50) / 10);
        default:
          return d3
            .symbol()
            .type(d3.symbolCircle)
            .size(symbolSize + 50)();
      }
    })
    .attr(
      "transform",
      `translate(${xScale(point.xvalue)},${yScale(point.yvalue)})`
    )
    .attr("fill", "none")
    .attr("stroke", "#222")
    .attr("stroke-width", 2)
    .style("pointer-events", "none");
}

function updateHighlightAll(svgContainer, point, state) {
  state.isDropdownMode = true;

  const areaId = point.name;

  // Remove old highlight shapes
  svgContainer.selectAll(".point-highlight").remove();

  // Select all matching elements and clone them as highlights
  d3.selectAll(`.circle-${removeSpaces(areaId)}`)
    .clone(true)
    .attr("class", "point-highlight")
    .attr("fill", "none")
    .style("pointer-events", "none")
    .attr("stroke", "#222")
    .attr("stroke-width", 2)
    .raise();
}

// Update tooltip content
function updateTooltip(tooltip, point, config) {
  const xFormatted = point.formattedValue || config.xValueFormat(point.xvalue);
  const yFormatted = config.yValueFormat(point.yvalue);

  let tooltipContent = `<div style="font-weight: bold; margin-bottom: 8px;">${point.name}</div>`;


  if (config.showGroup) {
    tooltipContent += `<div style="margin-bottom: 2px;">${config.groupLabel}: ${point.group}</div>`;
  }


  if (config.showXValue) {
    const marginBottom = config.showYValue ? "margin-bottom: 2px;" : "";
    tooltipContent += `<div style="${marginBottom}">${config.xLabel}: ${xFormatted}</div>`;
  }


  if (config.showYValue) {
    tooltipContent += `<div>${config.yLabel}: ${yFormatted}</div>`;
  }

  // ADD SIZE INFORMATION
  if (config.showSize && point[config.sizeField] !== undefined) {
    const sizeFormatted = config.sizeValueFormat(point[config.sizeField]);
    tooltipContent += `<div>${config.sizeLabel}: ${sizeFormatted}</div>`;
  }

  tooltip.html(tooltipContent);
}

// Position tooltip
function positionTooltip(tooltip, svgContainer, pointX, pointY, config) {
  const containerRect = svgContainer.node().getBoundingClientRect();
  const containerWidth =
    svgContainer.attr("width") ||
    svgContainer.node().getBoundingClientRect().width;

  // Position tooltip on left if point is on right half of container
  const offsetX =
    pointX > containerWidth / 2
      ? -config.offset.x - parseInt(config.width) + config.margin.left
      : config.offset.x + config.margin.left;

  tooltip
    .style("left", containerRect.left + pointX + offsetX + "px")
    .style(
      "top",
      containerRect.top + pointY + config.offset.y + config.margin.top + "px"
    )
    .style("visibility", "visible");
}

// Hide tooltip and highlight
function hideTooltipAndHighlight(tooltip, svgContainer, state) {
  tooltip.style("visibility", "hidden");
  svgContainer.selectAll(".point-highlight").remove();
  state.currentHighlight = null;
}

// Highlight point by index
function highlightPointByIndex(
  pointIndex,
  data,
  svgContainer,
  xScale,
  yScale,
  tooltip,
  config,
  state,
  shape,
  getSymbolSize,
  sizeScale
) {
  if (pointIndex >= 0 && pointIndex < data.length) {
    const point = data[pointIndex];
    state.currentHighlight = pointIndex;
    state.isKeyboardMode = false;
    state.isDropdownMode = true; // Enable dropdown mode

    updateHighlight(
      svgContainer,
      point,
      xScale,
      yScale,
      shape,
      getSymbolSize,
      sizeScale
    );
    updateTooltip(tooltip, point, config);
    positionTooltip(
      tooltip,
      svgContainer,
      xScale(point.xvalue),
      yScale(point.yvalue),
      config
    );
  }
}

// Clear highlight and disable dropdown mode
function clearHighlightAndDropdownMode(tooltip, svgContainer, state) {
  hideTooltipAndHighlight(tooltip, svgContainer, state);
  state.isDropdownMode = false;
}

// Create cleanup function
function createCleanupFunction(tooltip, overlay, svgContainer, state) {
  return function cleanup() {
    tooltip.remove();
    overlay.remove();
    svgContainer.selectAll(".point-highlight").remove();
    const svgElement = svgContainer.node().parentNode;
    d3.select(svgElement)
      .on("keydown", null)
      .on("focus", null)
      .on("blur", null);
    state.keyboardIndex = 0;
    state.isKeyboardMode = false;
    state.currentHighlight = null;
  };
}

/**
 * Creates direct labels for line chart endpoints with collision detection and positioning
 * @param {Object} params - Configuration object
 * @param {Array} params.categories - Array of category names to label
 * @param {Array} params.data - Array of data objects containing the values
 * @param {Object} params.svg - D3 SVG selection where labels will be added
 * @param {Function} params.xScale - D3 x-scale function
 * @param {Function} params.yScale - D3 y-scale function
 * @param {Object} params.margin - Margin object with left, right, top, bottom properties
 * @param {number} params.chartHeight - Height of the chart area
 * @param {Object} params.config - Configuration object containing styling options
 * @param {string} params.config.textColourPalette - Array of text colors
 * @param {string} params.config.colourPalette - Array of line colors (for leader lines)
 * @param {Object} params.options - Optional configuration
 * @param {number} params.options.minSpacing - Minimum spacing between labels (default: 12)
 * @param {boolean} params.options.useLeaderLines - Whether to draw leader lines for displaced labels (default: true)
 * @param {string} params.options.leaderLineStyle - Style for leader lines: 'dashed' or 'solid' (default: 'dashed')
 * @param {string} params.options.labelStrategy - Strategy for positioning labels: 'last' or 'lastValid' (default: 'lastValid')
 * @param {number} params.options.minLabelOffset - Minimum pixels from chart edge for labels (default: 5)
 */
export function createDirectLabels({
  categories,
  data,
  svg,
  xScale,
  yScale,
  margin,
  chartHeight,
  config,
  options = {},
}) {
  // Set default options
  const {
    minSpacing = 12,
    useLeaderLines = true,
    leaderLineStyle = "dashed",
    labelStrategy = "lastValid",
    minLabelOffset = 5,
  } = options;

  // Remove any existing direct labels and leader lines before adding new ones
  svg.selectAll("text.directLineLabel").remove();
  svg.selectAll("line.label-leader-line").remove();

  /**
   * Find the last valid (non-null, non-undefined) data point for a category
   * @param {Array} data - Array of data objects
   * @param {string} category - Category name to search for
   * @returns {Object|null} - Object with {datum, index} or null if no valid data found
   */
  function findLastValidDataPoint(data, category) {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][category] !== null && data[i][category] !== undefined) {
        return { datum: data[i], index: i };
      }
    }
    return null;
  }

  /**
   * Get the appropriate data point for labeling based on strategy
   * @param {Array} data - Array of data objects
   * @param {string} category - Category name
   * @param {string} strategy - 'last' or 'lastValid'
   * @returns {Object|null} - Object with {datum, index} or null
   */
  function getLabelDataPoint(data, category, strategy) {
    if (strategy === "last") {
      const lastDatum = data[data.length - 1];
      if (lastDatum[category] !== null && lastDatum[category] !== undefined) {
        return { datum: lastDatum, index: data.length - 1 };
      }
      return null;
    } else {
      // 'lastValid'
      return findLastValidDataPoint(data, category);
    }
  }

  let labelData = [];

  // Create all labels first and collect their data
  categories.forEach(function (category, index) {
    const labelPoint = getLabelDataPoint(data, category, labelStrategy);

    // Skip if no valid data point found
    if (!labelPoint) return;

    const { datum, index: dataIndex } = labelPoint;
    const xPos = xScale(datum.date);
    const yPos = yScale(datum[category]);

    // Calculate label x position - offset from data point or chart edge
    let labelX;
    if (dataIndex === data.length - 1) {
      // Last data point - place label to the right
      labelX = xPos + 10;
    } else {
      // Not the last point - check if there's room on the right
      const chartWidth = xScale.range()[1];
      const remainingSpace = chartWidth - xPos;

      if (remainingSpace > 60) {
        // Enough space for label
        labelX = xPos + 10;
      } else {
        // Not enough space - place label to the left
        labelX = xPos - 10;
      }
    }

    const label = svg
      .append("text")
      .attr("class", "directLineLabel")
      .attr("x", labelX)
      .attr("y", yPos)
      .attr("dy", ".35em")
      .attr("text-anchor", labelX > xPos ? "start" : "end") // Adjust anchor based on position
      .attr(
        "fill",
        config.textColourPalette[index % config.textColourPalette.length]
      )
      .text(category)
      .call(wrap, margin.right - 10); // Use available margin space

    // Get the actual height of the text element after wrapping
    const bbox = label.node().getBBox();

    labelData.push({
      node: label,
      x: labelX,
      y: yPos,
      originalY: yPos,
      dataX: xPos, // Store the actual data point x position
      dataY: yPos,
      height: bbox.height,
      width: bbox.width,
      category: category,
      categoryIndex: index,
      dataIndex: dataIndex,
      isLastPoint: dataIndex === data.length - 1,
    });
  });

  // Only run collision detection if we have multiple labels
  if (labelData.length > 1) {
    // Sort labels by their y position for easier collision detection
    labelData.sort((a, b) => a.y - b.y);

    // Simple collision detection and adjustment
    for (let i = 1; i < labelData.length; i++) {
      const current = labelData[i];
      const previous = labelData[i - 1];

      // Check if current label overlaps with previous
      const overlap = previous.y + previous.height + minSpacing - current.y;

      if (overlap > 0) {
        // Move current label down
        current.y += overlap;

        // Make sure it doesn't go below chart bounds
        if (current.y + current.height > chartHeight) {
          // If it would go below, try moving previous labels up
          const pushUp = current.y + current.height - chartHeight;

          // Move all previous labels up by the required amount
          for (let j = i - 1; j >= 0; j--) {
            labelData[j].y -= pushUp;
            // Don't let them go above the chart
            if (labelData[j].y < 0) {
              labelData[j].y = 0;
            }
          }

          // Adjust current label to fit
          current.y = chartHeight - current.height;
        }
      }
    }

    // Apply the adjusted positions and draw leader lines if needed
    labelData.forEach((label) => {
      label.node.attr("y", label.y);

      // Draw a leader line if the label is offset vertically from the end point and useLeaderLines is true
      if (useLeaderLines && Math.abs(label.y - label.originalY) > 1) {
        const strokeDashArray = leaderLineStyle === "dashed" ? "2,2" : "none";

        svg
          .append("line")
          .attr("class", "label-leader-line")
          .attr("x1", label.dataX) // Connect to actual data point
          .attr("y1", label.dataY)
          .attr("x2", label.x) // Connect to label position
          .attr("y2", label.y)
          .attr(
            "stroke",
            config.colourPalette[
              label.categoryIndex % config.colourPalette.length
            ]
          )
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", strokeDashArray);
      }
    });
  }

  return labelData; // Return label data in case caller needs it
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Calculate contrast ratio between two luminance values
function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function adjustColorForContrast(
  hex,
  requiredContrast = 3,
  backgroundHex = "#FFFFFF",
  saturationBoost = 0.1
) {
  let rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Parse background and handle its transparency
  let bgRgb = hexToRgb(backgroundHex);
  if (!bgRgb) bgRgb = { r: 255, g: 255, b: 255, a: 1 }; // fallback to white

  // If background has transparency, composite it against white first
  if (bgRgb.a !== undefined && bgRgb.a < 1) {
    bgRgb = {
      r: Math.round(bgRgb.r * bgRgb.a + 255 * (1 - bgRgb.a)),
      g: Math.round(bgRgb.g * bgRgb.a + 255 * (1 - bgRgb.a)),
      b: Math.round(bgRgb.b * bgRgb.a + 255 * (1 - bgRgb.a)),
      a: 1,
    };
  }

  // Now handle foreground color transparency against the (now opaque) background
  if (rgb.a !== undefined && rgb.a < 1) {
    rgb = {
      r: Math.round(rgb.r * rgb.a + bgRgb.r * (1 - rgb.a)),
      g: Math.round(rgb.g * rgb.a + bgRgb.g * (1 - rgb.a)),
      b: Math.round(rgb.b * rgb.a + bgRgb.b * (1 - rgb.a)),
    };
  }

  let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.min(1, hsl.s + saturationBoost);

  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  let luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  let contrast = getContrastRatio(bgLuminance, luminance);

  const step = 0.02;
  while (contrast < requiredContrast && hsl.l > 0) {
    hsl.l = Math.max(0, hsl.l - step);
    rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    contrast = getContrastRatio(bgLuminance, luminance);
  }

  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
export function getTextColorFromBackground(
  backgroundHex,
  requiredContrast = 3
) {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return "#222"; // Return black if invalid hex

  const backgroundLuminance = getLuminance(rgb.r, rgb.g, rgb.b);

  const whiteLuminance = 1;
  const blackLuminance = 0;

  const whiteContrast = getContrastRatio(backgroundLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(backgroundLuminance, blackLuminance);

  if (whiteContrast >= requiredContrast) {
    return "#ffffff";
  } else if (blackContrast >= requiredContrast) {
    return "#222";
  } else {
    return whiteContrast > blackContrast ? "#ffffff" : "#222";
  }
}

// Helper to generate x-axis ticks for both date and numeric axes
export function getXAxisTicks({ data, xDataType, size, config }) {
  let ticks = [];
  const method = config.xAxisTickMethod || "interval";
  if (xDataType === "date") {
    const start = data[0].date;
    const end = data[data.length - 1].date;
    if (method === "total") {
      const count = config.xAxisTickCount ? config.xAxisTickCount[size] : 5;
      ticks = d3.scaleTime().domain([start, end]).ticks(count);
    } else if (method === "interval") {
      const interval = config.xAxisTickInterval || {
        unit: "year",
        step: { sm: 1, md: 1, lg: 1 },
      };
      const step =
        typeof interval.step === "object" ? interval.step[size] : interval.step;
      let d3Interval;
      switch (interval.unit) {
        case "year":
          d3Interval = d3.timeYear.every(step);
          break;
        case "month":
          d3Interval = d3.timeMonth.every(step);
          break;
        case "quarter":
          d3Interval = d3.timeMonth.every(step * 3);
          break;
        case "day":
          d3Interval = d3.timeDay.every(step);
          break;
        default:
          d3Interval = d3.timeYear.every(1);
      }
      ticks = d3Interval.range(start, d3.timeDay.offset(end, 1));
    }
    if (!Array.isArray(ticks)) ticks = [];
    if (config.addFirstDate && !ticks.some((t) => +t === +start)) {
      ticks.unshift(start);
    }
    if (config.addFinalDate && !ticks.some((t) => +t === +end)) {
      ticks.push(end);
    }
  } else {
    // Numeric axis
    if (method === "total") {
      const count =
        config.xAxisTickCount && config.xAxisTickCount[size]
          ? config.xAxisTickCount[size]
          : 5;
      const extent = d3.extent(data, (d) => d.date);
      ticks = d3.ticks(extent[0], extent[1], count);
    } else if (method === "interval") {
      const interval = config.xAxisTickInterval || {
        unit: "number",
        step: { sm: 1, md: 1, lg: 1 },
      };
      const step =
        typeof interval.step === "object" ? interval.step[size] : interval.step;
      const extent = d3.extent(data, (d) => d.date);
      let current = extent[0];
      while (current <= extent[1]) {
        ticks.push(current);
        current += step;
      }
    }
    if (!Array.isArray(ticks)) ticks = [];
    if (config.addFirstDate && !ticks.some((t) => t === data[0].date)) {
      ticks.unshift(data[0].date);
    }
    if (
      config.addFinalDate &&
      !ticks.some((t) => t === data[data.length - 1].date)
    ) {
      ticks.push(data[data.length - 1].date);
    }
  }
  // Remove duplicates and sort
  ticks = Array.from(new Set(ticks.map((t) => +t)))
    .sort((a, b) => a - b)
    .map((t) => (xDataType === "date" ? new Date(t) : t));
  return ticks;
}

export function removeSpaces(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ""); // remove spaces, punctuation, etc.
}
