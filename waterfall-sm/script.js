import {
  initialise,
  wrap,
  addSvg,
  addAxisLabel,
  addChartTitleLabel,
  addSource,
  calculateChartWidth,
  adjustColorForContrast,
  diamondShape,
  setupArrowhead,
} from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let legend = d3.select("#legend");
let pymChild = null;
let graphic_data, size;

const locale = d3.formatLocale({
  thousands: ",",
  grouping: [3],
  currency: ["£", ""],
});

function getConfigSettings({ location, size }) {
  return Object.keys(location).includes("lg") ? location[size] : location;
}

function getPaddedXDomain(domain, padding) {
  const paddedDomain = [...domain];

  if (padding !== undefined && padding !== null) {
    let resolvedPadding = padding;

    if (isNaN(resolvedPadding)) {
      const paddingPercentage = Number(String(resolvedPadding).replace("%", "")) / 100;
      resolvedPadding =
        Math.abs(paddedDomain[0] - paddedDomain[1]) * paddingPercentage;
    }

    paddedDomain[0] = paddedDomain[0] - resolvedPadding;
    paddedDomain[1] = paddedDomain[1] + resolvedPadding;
  }

  return paddedDomain;
}

function resolveXDomain({ groups, xDomainConfig, xDomainPadding, groupIndex }) {
  if (xDomainConfig === "auto") {
    const values = groups[groupIndex].changes.flatMap((datum) => [datum.start, datum.end]);
    return getPaddedXDomain(d3.extent(values), xDomainPadding);
  }

  if (xDomainConfig === "auto-all") {
    const values = groups.flatMap((group) =>
      group.changes.flatMap((datum) => [datum.start, datum.end])
    );

    return getPaddedXDomain(d3.extent(values), xDomainPadding);
  }

  if (Array.isArray(xDomainConfig)) {
    return Array.isArray(xDomainConfig[0]) ? xDomainConfig[groupIndex] : xDomainConfig;
  }

  return xDomainConfig;
}

function drawGraphic() {
  const charWidth = 8;
  const labelOffset = 16;

  size = initialise(size);

  configKeys.forEach((key) => {
    config[key] = getConfigSettings({ location: configBackup[key], size });
  });

  const chartWidth = calculateChartWidth({
    screenWidth: parseInt(graphic.style("width")),
    chartEvery: config.chartEvery,
    chartMargin: config.margin,
    chartGap: config.chartGap,
  });

  const chartsPerRow = config.chartEvery;
  const calculateFinalValue = !graphic_data
    .map((d) => d.name.toLowerCase())
    .includes("end");

  const groups = d3.groups(graphic_data, (d) => d.group).map(([groupName, rows]) => {
    const chartRows = rows.map((row) => ({
      ...row,
      value: Number(row.value),
    }));

    const startFlag = { ...chartRows[0] };
    const explicitEndFlag = calculateFinalValue ? null : { ...chartRows[chartRows.length - 1] };
    const changes = chartRows.slice(1, calculateFinalValue ? undefined : -1);
    const totalChange = d3.sum(changes, (d) => d.value);

    if (
      config.yAxisSort === "ascending" ||
      (config.yAxisSort === "auto" && totalChange <= 0)
    ) {
      changes.sort((a, b) => a.value - b.value);
    } else if (
      config.yAxisSort === "descending" ||
      (config.yAxisSort === "auto" && totalChange > 0)
    ) {
      changes.sort((a, b) => b.value - a.value);
    }

    changes.forEach((datum, index) => {
      datum.start = index === 0 ? startFlag.value : changes[index - 1].end;
      datum.end = datum.start + datum.value;
    });

    const finalValue = changes.length > 0 ? changes[changes.length - 1].end : startFlag.value;
    const endFlag = calculateFinalValue
      ? { name: "End", value: finalValue }
      : {
          ...explicitEndFlag,
          customValue: explicitEndFlag.customValue || explicitEndFlag.value,
          value: finalValue,
        };

    const height = config.seriesHeight * changes.length;
    const yScale = d3
      .scalePoint()
      .padding(0.5)
      .range([0, height])
      .domain(changes.map((d) => d.name));
    const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(10);
    const bandwidth =
      changes.length > 1 ? yScale(changes[1].name) - yScale(changes[0].name) : config.seriesHeight;

    return {
      groupName,
      changes,
      flags: [startFlag, endFlag],
      height,
      yScale,
      yAxis,
      bandwidth,
    };
  });

  groups.forEach((group, index) => {
    group.xDomain = resolveXDomain({
      groups,
      xDomainConfig: config.xDomain,
      xDomainPadding: config.xDomainPadding,
      groupIndex: index,
    });
    group.xScale = d3.scaleLinear().range([0, chartWidth]).domain(group.xDomain);
    group.xAxis = d3
      .axisBottom(group.xScale)
      .ticks(config.xAxisTicks)
      .tickFormat(locale.format(config.xAxisNumberFormat));

    group.flags.forEach((flag, flagIndex) => {
      flag.x = group.xScale(flag.value);
      flag.y = flagIndex === 0 ? 0 : group.height;
      flag.colour =
        group.flags[1].value - group.flags[0].value >= 0
          ? config.colourPalette[0] + "65"
          : config.colourPalette[1] + "65";
    });

    group.noChangeThreshold = isNaN(config.noChangeThreshold)
      ? (group.flags[0].value * Number(config.noChangeThreshold.replace("%", ""))) / 100
      : config.noChangeThreshold;

    group.changes.forEach((datum) => {
      datum.x1 = group.xScale(datum.start);
      datum.x2 = group.xScale(datum.end);
      datum.y = group.yScale(datum.name);
      datum.labelText =
        Math.abs(datum.value) < group.noChangeThreshold && config.noChangeCustomLabel
          ? config.noChangeCustomLabel
          : datum.value >= 0
          ? "+" +
            config.dataLabels.prefix +
            locale.format(config.dataLabels.format)(Math.abs(datum.value)) +
            config.dataLabels.suffix
          : "–" +
            config.dataLabels.prefix +
            locale.format(config.dataLabels.format)(Math.abs(datum.value)) +
            config.dataLabels.suffix;
      datum.labelLength = datum.labelText.length * charWidth;

      if (Math.abs(datum.x1 - datum.x2) > datum.labelLength + labelOffset) {
        datum.labelPosition = "middle";
        datum.labelOffset = 0;
      } else if (
        (Math.abs(datum.value) < group.noChangeThreshold || datum.x1 > datum.x2) &&
        datum.x1 + datum.labelLength > chartWidth
      ) {
        datum.labelPosition = "x2";
        datum.labelOffset = -labelOffset;
      } else if (datum.x1 < datum.x2 && datum.x1 - datum.labelLength < 0) {
        datum.labelPosition = "x2";
        datum.labelOffset = labelOffset;
      } else if (datum.x1 < datum.x2) {
        datum.labelPosition = "x1";
        datum.labelOffset = -labelOffset;
      } else {
        datum.labelPosition = "x1";
        datum.labelOffset = labelOffset;
      }
    });
  });

  const chartContainers = graphic
    .selectAll(".chart-container")
    .data(groups)
    .join("div")
    .attr("class", "chart-container");

  chartContainers.each(function (group, chartIndex) {
    const chartPosition = chartIndex % chartsPerRow;
    const margin = { ...config.margin };
    const flagOffset = config.showXAxis ? 35 : 25;

    if (config.dropYAxis && chartPosition !== 0) {
      margin.left = config.chartGap;
    }

    const svg = addSvg({
      svgParent: d3.select(this),
      chartWidth,
      height: group.height + margin.top + margin.bottom,
      margin,
    });

    if (chartIndex === 0) {
      setupArrowhead(svg);
    }

    svg
      .append("g")
      .attr("class", "y axis")
      .call(
        group.yAxis.tickFormat((d) =>
          config.dropYAxis !== true || chartPosition === 0 ? d : ""
        )
      )
      .selectAll("text")
      .call(wrap, Math.max(margin.left - margin.left / 10, config.chartGap));

    if (config.showXAxis) {
      svg
        .append("g")
        .attr("transform", `translate(0,${group.height})`)
        .attr("class", "x axis")
        .call(group.xAxis.tickSize(-group.height))
        .selectAll("line")
        .each(function (d) {
          if (d === 0) {
            d3.select(this).attr("class", "zero-line");
          }
        });
    }

    svg
      .selectAll("line.guide")
      .data(group.changes)
      .join("line")
      .attr("class", "guide")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", (d) => d.y)
      .attr("y2", (d) => d.y)
      .attr("stroke", ONScolours.grey20)
      .attr("stroke-width", "1px");

    if (config.showZeroLine) {
      svg
        .append("line")
        .attr("class", "zero-line")
        .attr("x1", group.xScale(0))
        .attr("x2", group.xScale(0))
        .attr("y1", -flagOffset)
        .attr("y2", group.height);
    }

    svg
      .selectAll("line.flag")
      .data(group.flags)
      .join("line")
      .attr("class", "flag")
      .attr("x1", (d) => d.x)
      .attr("x2", (d) => d.x)
      .attr("y1", (d, i) => (i === 0 ? d.y + group.bandwidth / 2 : d.y - group.bandwidth / 2))
      .attr("y2", (d, i) => (i === 0 ? d.y - flagOffset : d.y + flagOffset))
      .attr("stroke", ONScolours.grey50)
      .attr("stroke-width", "2px");

    svg
      .selectAll("circle.flagCircle")
      .data(group.flags)
      .join("circle")
      .attr("class", "flagCircle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d, i) => (i === 0 ? d.y - flagOffset + 6 : d.y + flagOffset - 6))
      .attr("r", config.dotSize)
      .attr("stroke", ONScolours.grey50)
      .attr("stroke-width", 1.5)
      .attr("fill", (d, i) => (i === 0 ? "white" : ONScolours.grey50));

    svg
      .selectAll("text.flagText")
      .data(group.flags)
      .join("text")
      .attr("class", "flagText")
      .attr("x", (d) => d.x)
      .attr("dx", (d) => (d.x < chartWidth / 2 ? 14 : -14))
      .attr("text-anchor", (d) => (d.x < chartWidth / 2 ? "start" : "end"))
      .attr("font-size", "14px")
      .attr("y", (d, i) => (i === 0 ? d.y - flagOffset + 10 : d.y + flagOffset))
      .text((d, i) =>
        i === 0
          ? config.flagLabels.start.prefix +
            locale.format(config.flagLabels.start.format)(d.value) +
            config.flagLabels.start.suffix
          : calculateFinalValue === false
          ? config.flagLabels.end.prefix +
            locale.format(config.flagLabels.end.format)(d.customValue) +
            config.flagLabels.end.suffix
          : config.flagLabels.end.prefix +
            locale.format(config.flagLabels.end.format)(d.value) +
            config.flagLabels.end.suffix
      )
      .call(wrap, 200);

    if (config.netChange.show && size === "sm") {
      svg
        .append("text")
        .attr("class", "flagText")
        .attr("x", group.flags[1].x)
        .attr("dx", group.flags[1].x < chartWidth / 2 ? 14 : -14)
        .attr("text-anchor", group.flags[1].x < chartWidth / 2 ? "start" : "end")
        .attr("font-size", "14px")
        .attr("y", group.flags[1].y + flagOffset + 18)
        .text(
          config.netChange.title +
            config.netChange.prefix +
            locale.format(config.netChange.format)(
              group.flags[1].value - group.flags[0].value
            ) +
            config.netChange.suffix
        );
    }

    if (config.netChange.show && size !== "sm") {
      const netChangeG = svg.append("g").attr("class", "netChange");

      netChangeG
        .append("rect")
        .attr("class", "netChange")
        .attr("x", Math.min(group.flags[0].x, group.flags[1].x))
        .attr("y", group.height + flagOffset + 10)
        .attr("width", Math.abs(group.flags[0].x - group.flags[1].x))
        .attr("height", 27)
        .attr("fill", group.flags[1].colour);

      netChangeG
        .append("text")
        .attr("class", "dataLabels")
        .attr(
          "x",
          Math.min(group.flags[0].x, group.flags[1].x) +
            Math.abs(group.flags[0].x - group.flags[1].x) / 2
        )
        .attr("y", group.height + flagOffset + 35)
        .attr("fill", adjustColorForContrast(group.flags[1].colour.substring(0, 7), 4.5))
        .text(
          config.netChange.title +
            config.netChange.prefix +
            locale.format(config.netChange.format)(
              group.flags[1].value - group.flags[0].value
            ) +
            config.netChange.suffix
        )
        .call(wrap, Math.abs(group.flags[0].x - group.flags[1].x));
    }

    svg
      .selectAll("line.down")
      .data(group.changes)
      .join("line")
      .attr("class", "down")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x1)
      .attr("y1", (d) => d.y)
      .attr("y2", (d) => -group.bandwidth + d.y)
      .attr("stroke", ONScolours.grey30)
      .attr("stroke-width", "1.5px")
      .style("stroke-dasharray", "4 4")
      .attr("display", (d, i) => (i === 0 ? "none" : "block"));

    svg
      .selectAll("line.between")
      .data(group.changes.filter((datum) => Math.abs(datum.value) >= group.noChangeThreshold))
      .join("line")
      .attr("class", "between")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y)
      .attr("y2", (d) => d.y)
      .attr("stroke", (d) =>
        d.start > d.end ? config.colourPalette[1] : config.colourPalette[0]
      )
      .attr("stroke-width", "3px")
      .attr("marker-end", (d) =>
        d.start > d.end
          ? "url(#annotation_arrowhead_left)"
          : "url(#annotation_arrowhead_right)"
      );

    svg
      .selectAll("path.nochangemarker")
      .data(group.changes.filter((datum) => Math.abs(datum.value) < group.noChangeThreshold))
      .join("path")
      .attr("class", "nochangemarker diamond")
      .attr("d", diamondShape(config.diamondSize))
      .attr("fill", config.colourPalette[2])
      .attr("transform", (d) => `translate(${d.x2}, ${d.y})`);

    svg
      .selectAll("line.nochangeline")
      .data(group.changes.filter((datum) => Math.abs(datum.value) < group.noChangeThreshold))
      .join("line")
      .attr("class", "nochangeline between")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y)
      .attr("y2", (d) => d.y)
      .attr("stroke", config.colourPalette[2])
      .attr("stroke-width", "3px");

    if (config.dataLabels.show === true) {
      svg
        .selectAll("text.changeLabel")
        .data(group.changes.filter((datum) => Math.abs(datum.value) >= group.noChangeThreshold))
        .join("text")
        .attr("class", "dataLabels")
        .attr("x", (d) => {
          if (d.labelPosition === "middle") {
            return d.x1 > d.x2
              ? d.x1 - Math.abs(d.x1 - d.x2) / 2
              : d.x1 + Math.abs(d.x1 - d.x2) / 2;
          }

          return d.labelPosition === "x2" ? d.x2 + d.labelOffset : d.x1 + d.labelOffset;
        })
        .attr("y", (d) => (d.labelPosition === "middle" ? d.y - 12 : d.y))
        .attr("dy", 6)
        .attr("text-anchor", (d) => {
          if (d.labelPosition === "middle") {
            return "middle";
          }

          return d.labelOffset > 0 ? "start" : "end";
        })
        .attr("fill", (d) =>
          d.x1 < d.x2 ? config.colourPalette[0] : config.colourPalette[1]
        )
        .attr("stroke", "rgba(255,255,255,0.7)")
        .attr("stroke-width", 4)
        .attr("paint-order", "stroke")
        .attr("stroke-linecap", "round")
        .text((d) => d.labelText);

      svg
        .selectAll("text.noChangeLabel")
        .data(group.changes.filter((datum) => Math.abs(datum.value) < group.noChangeThreshold))
        .join("text")
        .attr("class", "dataLabels")
        .attr("x", (d) => (d.labelPosition === "x2" ? d.x2 + d.labelOffset : d.x1 + d.labelOffset))
        .attr("y", (d) => d.y)
        .attr("dy", 6)
        .attr("text-anchor", (d) => (d.labelOffset > 0 ? "start" : "end"))
        .attr("fill", config.colourPalette[2])
        .attr("stroke", "rgba(255,255,255,0.7)")
        .attr("stroke-width", 4)
        .attr("paint-order", "stroke")
        .attr("stroke-linecap", "round")
        .text((d) => d.labelText);
    }

    addChartTitleLabel({
      svgContainer: svg,
      yPosition: -15,
      text: group.groupName,
      wrapWidth: chartWidth,
    });

    if (
      config.showXAxis &&
      (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === groups.length - 1)
    ) {
      addAxisLabel({
        svgContainer: svg,
        xPosition: chartWidth,
        yPosition: group.height + 45,
        text: config.xAxisLabel,
        textAnchor: "end",
        wrapWidth: chartWidth,
      });
    }
  });

  drawLegend();
  addSource("source", config.sourceText);

  if (pymChild) {
    pymChild.sendHeight();
  }

  function drawLegend() {
    const lineLength =
      config.legendItemWidth -
      20 -
      config.legendLabels.min.length * charWidth -
      config.legendLabels.max.length * charWidth;

    const legendMap = [
      {
        key: "Inc",
        color: config.colourPalette[0],
        label: config.legendText[1],
        render: drawIncrease,
      },
      {
        key: "Dec",
        color: config.colourPalette[1],
        label: config.legendText[0],
        render: drawDecrease,
      },
      {
        key: "No",
        color: config.colourPalette[2],
        label: config.legendText[2],
        render: drawNoChange,
      },
    ];

    const items = legend
      .selectAll("div.legend--item")
      .data(legendMap)
      .join("div")
      .attr("class", (d) => `legend--item ${d.key}`);

    items.each(function (entry) {
      const g = d3
        .select(this)
        .append("svg")
        .attr("width", config.legendItemWidth)
        .attr("height", config.legendHeight)
        .append("g")
        .attr("class", "legendContent");

      entry.render(g, entry.color, entry.label);
    });

    function drawIncrease(g, color, label) {
      g.append("text")
        .attr("y", 30)
        .attr("class", "mintext legendLabel")
        .attr("fill", color)
        .text(config.legendLabels.min);

      const minTextWidth = g.select("text.mintext").node().getBBox().width + 5;

      g.append("line")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("y1", 26)
        .attr("y2", 26)
        .attr("x1", minTextWidth)
        .attr("x2", minTextWidth + lineLength)
        .attr("marker-end", "url(#annotation_arrowhead_right)");

      g.append("text")
        .attr("y", 30)
        .attr("x", minTextWidth + lineLength + config.dotSize + 5)
        .attr("class", "maxtext legendLabel")
        .attr("fill", color)
        .text(config.legendLabels.max);

      const maxTextWidth = g.select("text.maxtext").node().getBBox().width + 5;

      g.append("text")
        .attr("y", 12)
        .attr("x", (minTextWidth + lineLength + config.dotSize + maxTextWidth) / 2)
        .attr("text-anchor", "middle")
        .attr("class", "legendLabel")
        .attr("fill", color)
        .text(label);
    }

    function drawDecrease(g, color, label) {
      const maxWidth = config.legendLabels.max.length * charWidth + 5;
      const minWidth = config.legendLabels.min.length * charWidth + 5;

      g.append("line")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("y1", 26)
        .attr("y2", 26)
        .attr("x1", maxWidth + config.dotSize + lineLength)
        .attr("x2", maxWidth + config.dotSize)
        .attr("marker-end", "url(#annotation_arrowhead_left)");

      g.append("text")
        .attr("y", 30)
        .attr("x", 0)
        .attr("class", "legendLabel")
        .attr("fill", color)
        .text(config.legendLabels.max);

      g.append("text")
        .attr("y", 30)
        .attr("x", maxWidth + lineLength + config.dotSize + 5)
        .attr("class", "legendLabel")
        .attr("fill", color)
        .text(config.legendLabels.min);

      g.append("text")
        .attr("y", 12)
        .attr("x", (maxWidth + lineLength + config.dotSize + minWidth) / 2)
        .attr("text-anchor", "middle")
        .attr("class", "legendLabel")
        .attr("fill", color)
        .text(label);
    }

    function drawNoChange(g, color, label) {
      const cx = config.legendItemWidth / 2;

      g.append("path")
        .attr("d", diamondShape(config.diamondSize))
        .attr("fill", color)
        .attr("transform", `translate(${cx}, 26)`);

      g.append("text")
        .attr("y", 12)
        .attr("x", cx)
        .attr("text-anchor", "middle")
        .attr("class", "legendLabel")
        .text(label);
    }
  }
}

let configBackup = { ...config };
let configKeys = Object.keys(configBackup);

d3.csv(config.graphicDataURL).then((data) => {
  graphic_data = data;

  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
