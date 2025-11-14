import {
  initialise,
  wrap,
  addSvg,
  addAxisLabel
} from "../lib/helpers.js";

let graphic = d3.select("#graphic");
let legend = d3.select("#legend");
let pymChild = null;
let graphic_data,
  size,
  svgs,
  xDomain,
  divs,
  charts,
  var_group,
  var_group2,
  var_group3,
  svg;


  //set presets for d3.format (this should probably end up in our helpers folder and be consistent across templates)
 const locale = d3.formatLocale({
  thousands: ",",
  grouping: [3],
  currency: ["£", ""]
});

  //function to fetch settings for config. Will check if different settings for screensizes has been set
  function getConfigSettings({location,size}){
    return Object.keys(location).includes("lg") ? location[size] : location
  }

  function addXDomainPadding(padding){
    if(isNaN(padding)){
      const paddingPercentage = Number(padding.replace("%",""))/100
      padding = Math.abs(xDomain[0] - xDomain[1]) * paddingPercentage
    }
    xDomain[0] = xDomain[0] - padding
    xDomain[1] = xDomain[1] + padding
  }


  //set up backup of config that is not overwritten when screensize changes
  let configBackup = {...config}
  let configKeys = Object.keys(configBackup)

function drawGraphic() {
  //these shouldn't need changing unless font-sizes change or you need to later alter label placement
  const char_width = 8
  const labelOffset = 16
  const flagOffset = config.showXAxis == true ? 35 : 25

  //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
  size = initialise(size);

  //fetch config settings
  configKeys.forEach((c, i) => {
    config[c] = getConfigSettings({location: configBackup[c], size: size})
  })

  const chart_width =
    parseInt(graphic.style("width")) - config.margin.left - config.margin.right;



  let groups = d3.groups(graphic_data, (d) => d.group);

  //check if a final value has been defined in the dataset
  const calculateFinalValue = graphic_data.map((d) => d.name.toLowerCase()).includes("end") ? false : true

  // create the y scale in groups
  groups.map(function (d) {

    d[7] = []
    const arrayLength = d[1].length

    let totalChange = 0;

    d[1].forEach((datum, i) => {
      datum.value = Number(datum.value)
      totalChange = totalChange + datum.value
      //take start and end values from the data array
      if(i == 0 || (calculateFinalValue == false && i == arrayLength - 1)){
        d[7].push(datum)
      //calculate start and end values for each row of data
      }
    })

    //remove start values from d[1], remove end value if a final value has been defined
    if(calculateFinalValue == false){d[1].pop()}
    d[1].shift()

    //sort data by size of change as specified in config
    if(config.yAxisSort == "ascending" || (config.yAxisSort == "auto" && totalChange <= 0)){
      d[1].sort((a,b) => a.value - b.value)
    } else if(config.yAxisSort == "descending" || (config.yAxisSort == "auto" && totalChange > 0)){
      d[1].sort((a,b) => b.value - a.value)
    }

    //calculate the start and end point for each arrow
    d[1].forEach((datum, i) => {
        datum.start = i == 0 ? d[7][0].value : d[1][i-1].end
        datum.end = datum.start + datum.value
    })

    //calculate the end flag value where this hasn't been defined in the dataset, or push the end value to the flag data array
    if(calculateFinalValue == true){
      d[7].push({
        name: "End", 
        value: d[1][d[1].length-1].end
      })
    } else{
      d[7][1].customValue = d[7][1].value
      d[7][1].value = d[1][d[1].length-1].end
    }

    //series height
    d[2] = config.seriesHeight * d[1].length;

    // y scale
    d[3] = d3
      .scalePoint()
      .padding(0.5)
      .range([0, d[2]])
      .domain(d[1].map((d) => d.name));

    //y axis generator
    d[4] = d3
      .axisLeft(d[3])
      .tickSize(0)
      .tickPadding(10);

  });

  //set x domain
  groups.forEach((d,i) => {
    //auto scales for each chart
    if(config.xDomain == "auto"){ 
      let values = d[1].map((datum) => datum.start).concat(d[1].map((datum) => datum.end))
      xDomain = d3.extent(values)
      //add additional padding to the x domain
      addXDomainPadding(config.xDomainPadding)
    }
    //auto scales based on extent of all charts
    else if(config.xDomain == "auto-all"){ 
      let values = []
      groups.forEach((group) => {
        group[1].forEach((datum) => {
          values.push(datum.start)
          values.push(datum.end)
        })
      })
      xDomain = d3.extent(values)
      //add additional padding to the x domain
      addXDomainPadding(config.xDomainPadding)
    }
    //custom arrays
    else if(Array.isArray(config.xDomain) == true){
      //if custom domains have been set for each chart as an array
      if(config.xDomain.length > 1){
        xDomain = config.xDomain[i]
      //if global custom domain has been set
      } else{
        xDomain = config.xDomain
      }
    }

    //x scale
    d[5] = d3
      .scaleLinear()
      .range([0, chart_width])
      .domain(xDomain);

    //x axis generator
    d[6] = d3
      .axisBottom(d[5])
      .ticks(config.xAxisTicks)
      .tickFormat(locale.format(config.xAxisNumberFormat));

    //pixel coordinates for start and end flags  
    d[7].forEach((datum, i) => {
      datum.x = d[5](datum.value)
      datum.y = i == 0 ? 0 : d[2]
    })

    //set no change threshold
    //check if noChangeThreshold is not a number (assume % is set)
    d[8] = isNaN(config.noChangeThreshold) ?
      d[7][0].value * Number(config.noChangeThreshold.replace("%",""))/100 :
      config.noChangeThreshold
    
    //pixel coordinates and label placements for arrows 
    d[1].forEach((datum) => {
      datum.x1 = d[5](datum.start)
      datum.x2 = d[5](datum.end)
      datum.y = d[3](datum.name)
      datum.labelText = 
        Math.abs(datum.value) < d[8] && config.noChangeCustomLabel ?
          config.noChangeCustomLabel : datum.value >= 0 ?
          "+" +config.dataLabels.prefix + locale.format(config.dataLabels.format)(Math.abs(datum.value)) + config.dataLabels.suffix :
          "–" +config.dataLabels.prefix + locale.format(config.dataLabels.format)(Math.abs(datum.value)) + config.dataLabels.suffix
      datum.labelLength = datum.labelText.length*char_width
      if(Math.abs(datum.x1 - datum.x2) > datum.labelLength + labelOffset){
        datum.labelPosition = "middle"
        datum.labelOffset = 0
      } else if((Math.abs(datum.value) < d[8] || datum.x1 > datum.x2) && datum.x1 + datum.labelLength > chart_width){
        datum.labelPosition = "x2"
        datum.labelOffset = -labelOffset
      } else if(datum.x1 < datum.x2 && datum.x1 - datum.labelLength < 0){
        datum.labelPosition = "x2"
        datum.labelOffset = labelOffset
      } else if(datum.x1 < datum.x2){
        datum.labelPosition = "x1"
        datum.labelOffset = -labelOffset
      } else{
        datum.labelPosition = "x1"
        datum.labelOffset = labelOffset
      }
    })
  })

  // calculate the bandwidth, as .bandwidth() does not work
  let bandwidth =
    groups[0][3](groups[0][3].domain()[1]) -
    groups[0][3](groups[0][3].domain()[0]);

  divs = graphic.selectAll("div.categoryLabels").data(groups).join("div");

  if (groups.length > 1) {
    divs
      .append("p")
      .attr("class", "groupLabels")
      .html((d) => d[0]);
  }

  let charts = addSvg({
    svgParent: divs,
    chartWidth: chart_width,
    height: (d) => d[2] + config.margin.top + config.margin.bottom,
    margin: config.margin,
  });

  charts.each(function (d) {
    d3.select(this)
      .append("g")
      .attr("class", "y axis")
      .call(d[4])
      .selectAll("text")
      .call(wrap, config.margin.left - config.margin.left / 10);

    //  {#8f2,0} Making x axis optional
    d3.select(this);
    if (config.showXAxis) {
      d3.select(this)
        .append("g")
        .attr("transform", (d) => "translate(0," + d[2] + ")")
        .attr("class", "x axis")
        .each(function () {
          d3.select(this)
            .call(d[6].tickSize(-d[2]))
            .selectAll("line")
            .each(function (e) {
              if (e == 0) {
                d3.select(this).attr("class", "zero-line");
              }
            });
        });
    }
  });

  //set up left arrowhead
  const svgDefs = d3.select("svg").append("svg:defs");
  const arrowheadMarker = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead_left")
    .attr("class", "annotation_arrow_left")
    .attr("refX", 3.27)
    .attr("refY", 3.86)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadMarker.append("path")
    .attr("stroke", "context-stroke")
    .attr("d", "M0.881836 1.45544L3.27304 3.84665L0.846591 6.2731")

  const arrowheadMarker2 = svgDefs.append("svg:marker")
    .attr("id", "annotation_arrowhead_right")
    .attr("class", "annotation_arrow_right")
    .attr("refX", 3.27)
    .attr("refY", 3.86)
    .attr("markerWidth", 20)
    .attr("markerHeight", 20)
    .attr("orient", "auto");
  arrowheadMarker2.append("path")
      .attr("stroke", "context-stroke")
    .attr("d", "M0.881836 1.45544L3.27304 3.84665L0.846591 6.2731") 

  charts
    .selectAll("line.guide")
    .data((d) => d[1])
    .join("line")
    .attr("class", "guide")
    .attr("x1", 0)
    .attr("x2", (d) => chart_width)
    .attr("y1", (d) => d.y)
    .attr("y2", (d) => d.y)
    .attr("stroke", "#d9d9d9")
    .attr("stroke-width", "1px");

  // Add option for zero line at x = 0
  if (config.showZeroLine) {
    charts
      .append("line")
      .attr("class", "zero-line")
      .attr("x1", d[5](0))
      .attr("x2", d[5](0))
      .attr("y1", -flagOffset)
      .attr("y2", (d) => d[2]);
  }

  //create start and end flags
  charts
    .selectAll("line.flag")
    .data((d) => {
      return d[7]
    })
    .join("line")
    .attr("class", "flag")
    .attr("x1", (d) => d.x)
    .attr("x2", (d) => d.x)
    .attr("y1", (d,i) => i == 0 ? d.y + bandwidth/2 : d.y - bandwidth/2)
    .attr("y2", (d,i) => i == 0 ? d.y - flagOffset : d.y + flagOffset)
    .attr('stroke', "#a7a7a7")
    .attr("stroke-width", "2px")

  charts
    .selectAll("rect.flagRect")
    .data((d) => {
      return d[7]
    })
    .join("rect")
    .attr("class", "flagRect")
    .attr("x", (d,i) => d.x - 11/2)
    .attr("y", (d,i) => i == 0 ? d.y-flagOffset : d.y+flagOffset-11)
    .attr("width", 11)
    .attr("height", 11)
    .attr("stroke", "#a7a7a7")
    .attr("stroke-width", 1.5)
    .attr("fill", (d,i) => i == 0 ? "white" : "#a7a7a7")
   	.attr('transform', (d, i) => i == 0 ? `rotate(45 ${d.x} ${d.y-flagOffset+11/2})` : `rotate(45 ${d.x} ${d.y+flagOffset-11/2})`) 

  charts
    .selectAll("text.flagText")
    .data((d) => {
      return d[7]
    })
    .join("text")
    .attr("class", "flagText")
    .attr("x", (d) => d.x)
    .attr("dx", (d) => d.x < chart_width/2 ? 14 : -14)
    .attr("text-anchor", (d) => d.x < chart_width/2 ? "start" : "end")
    .attr("font-size", "14px")
    .attr("y", (d,i) => i == 0 ? d.y - flagOffset + 10 : d.y + flagOffset)
    .text((d,i) => 
      i == 0 ? 
        config.flagLabels.start.prefix + locale.format(config.flagLabels.start.format)(d.value) + config.flagLabels.start.suffix :
        calculateFinalValue == false ? 
          config.flagLabels.end.prefix + locale.format(config.flagLabels.end.format)(d.customValue) + config.flagLabels.end.suffix :
            config.flagLabels.end.prefix + locale.format(config.flagLabels.end.format)(d.value) + config.flagLabels.end.suffix )
    .call(wrap,200)

    //create net change bars
    if(config.netChange.show){

      let netChangeG = charts.append("g").attr("id","netChange").attr("class","netChange")

      netChangeG
        .append("rect")
        .attr("id",(d,i) => "netChangeRect"+i)
        .attr("class","netChange")
        .attr("x", (d) => Math.min(d[7][0].x, d[7][1].x))
        .attr("y", (d) => d[2] + flagOffset + 10)
        .attr("width", (d) => Math.abs(d[7][0].x - d[7][1].x))
        .attr("height", 27)
        .attr("fill", (d) => d[7][0].value > d[7][1].value ? "#F99095" : "#c6d6e5" )

      netChangeG
        .append("line")
        .attr("class",(d,i) => "netChangeLine"+i)
        .attr("x1", (d) => d[7][0].x)
        .attr("x2", (d) => d[7][0].x)
        .attr("y1", (d) => d[2] + flagOffset + 10)
        .attr("stroke", (d) => d[7][1].value - d[7][0].value >= 0 ? "#003C57" : "#871A5B")

      netChangeG
        .append("line")
        .attr("class",(d,i) => "netChangeLine"+i)
        .attr("x1", (d) => d[7][1].x)
        .attr("x2", (d) => d[7][1].x)
        .attr("y1", (d) => d[2] + flagOffset + 10)
        .attr("stroke", (d) => d[7][1].value - d[7][0].value >= 0 ? "#003C57" : "#871A5B")

      netChangeG
        .append("text")
        .attr("id", (d,i) => "netChangeLabel"+i)
        .attr("class","dataLabels")
        .attr("x", (d) => Math.min(d[7][0].x, d[7][1].x) + Math.abs(d[7][0].x - d[7][1].x)/2)
        .attr("y", (d) => d[2] + flagOffset + 35)
        .attr("fill", "#414042")
        .text((d) => config.netChange.title + config.netChange.prefix + locale.format(config.netChange.format)(d[7][1].value - d[7][0].value) + config.netChange.suffix)
     
      // calculate height of wrapped text within net change bars and set height of accompanying bar  
      groups.forEach((group,i) => {
        const lineHeight = 19.2
        const rectWidth = Number(d3.select("#netChangeRect"+i).style("width").replace("px",""))
        d3.select("#netChangeLabel"+i).call(wrap,rectWidth)
        var elem = document.getElementById("netChangeLabel"+i)
        var textHeight = window.getComputedStyle(elem).height;
        const numberOfLines = document.getElementById("netChangeLabel"+i).childElementCount
        d3.select("#netChangeRect"+i).attr("height",5 + numberOfLines*lineHeight)
        d3.selectAll(".netChangeLine"+i).attr("y2", group[2] + 10 + flagOffset + 5 + (numberOfLines*lineHeight))
      })
    }

    // add the dashed lines to connect categories
    charts
      .selectAll("line.down")
      .data((d) => d[1])
      .join("line")
      .attr("class", "down")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x1)
      .attr("y1", (d) => d.y)
      .attr("y2",(d) => -bandwidth + d.y)
      .attr("stroke", "#C6C6C6")
      .attr("stroke-width", "1.5px")
      .style("stroke-dasharray", "4 4")
      .attr("display", (d, i) => (i === 0 ? "none" : "block"));

    // add the range lines for each category  
    charts 
      .selectAll("line.between")
      .data((d) => d[1].filter((data) => Math.abs(data.value) >= d[8]))
      .join("line")
      .attr("class", "between")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y)
      .attr("y2", (d) => d.y)
      .attr("stroke", (d) =>
        d.start > d.end
          ? config.colour_palette[1]
          : config.colour_palette[0]
      )
      .attr("stroke-width", "3px")
      .attr("marker-end", (d) =>
          d.start > d.end
            ? "url(#annotation_arrowhead_left)"
            : "url(#annotation_arrowhead_right)"
      );


    // add 0 circles for no change
    charts
      .selectAll("nochangemarker.circle")
      .data((d) => d[1].filter((data) => Math.abs(data.value) < d[8]))
      .join("circle")
      .attr("class", "nochangemarker")
      .attr("cx", (d) => d.x2)
      .attr("cy", (d) => d.y)
      .attr("r", config.dotSize)
      .attr("fill", config.colour_palette[2]);

    charts
      .selectAll("nochangeline.line")
      .data((d) => d[1].filter((data) => Math.abs(data.value) < d[8]))
      .join("line")
      .attr("class", "nochangeline between")
      .attr("x1", (d) => d.x1)
      .attr("x2", (d) => d.x2)
      .attr("y1", (d) => d.y)
      .attr("y2", (d) => d.y)
      .attr("stroke", config.colour_palette[2])
      .attr("stroke-width", "3px")

    //add change data labels
    if(config.dataLabels.show == true){
      charts
        .selectAll("text.dif")
        .data((d) => d[1].filter((data) => Math.abs(data.value) >= d[8]))
        .join("text")
        .attr("class", "dataLabels")
        .attr("x", (d) => {
          if(d.labelPosition == "middle"){
            if(d.x1 > d.x2){
              return d.x1 - (Math.abs(d.x1 - d.x2)/2)
            } else{
              return d.x1 + (Math.abs(d.x1 - d.x2)/2)
            }
          } else if(d.labelPosition == "x2"){
            return d.x2 + d.labelOffset
          } else{
            return d.x1 + d.labelOffset
          }
        })
        .attr("y", (d) => d.labelPosition == "middle" ? d.y - 12 : d.y)
        .attr("dy", 6)
        .attr("text-anchor", (d) => {
          if(d.labelPosition == "middle"){
            return "middle"
          } else if(d.labelOffset > 0){
            return "start"
          } else{
            return "end"
          }
        })
        .attr("fill", (datum) => datum.x1 < datum.x2 ? config.colour_palette[0] : config.colour_palette[1])
        .attr("stroke", "rgba(255,255,255,0.7)")
        .attr("stroke-width", 4)
        .attr("paint-order", "stroke")
        .attr("stroke-linecap", "round").
        text((d) => d.labelText)

      //add no change data labels
      charts
        .selectAll("text.dif")
        .data((d) => d[1].filter((data) => Math.abs(data.value) < d[8]))
        .join("text")
        .attr("class", "dataLabels")
        .attr("x", (d) => d.labelPosition == "x2" ? d.x2 + d.labelOffset : d.x1 + d.labelOffset)
        .attr("y", (d) => d.y)
        .attr("dy", 6)
        .attr("text-anchor", (d) => d.labelOffset > 0 ? "start" : "end")
        .attr("fill", config.colour_palette[2])
        .attr("stroke", "rgba(255,255,255,0.7)")
        .attr("stroke-width", 4)
        .attr("paint-order", "stroke")
        .attr("stroke-linecap", "round").
        text((d) => d.labelText)
      }

  // add x axis label
  charts.each(function (d, i) {
    addAxisLabel({
      svgContainer: d3.select(this),
      xPosition: chart_width,
      yPosition: d[2] + 45,
      text: config.xAxisLabel,
      textAnchor: "end",
      wrapWidth: chart_width,
    });
  });

  // Set up the legend
  let legenditem = d3
    .select("#legend")
    .selectAll("div.legend--item")
    .data(config.legendItems)
    .enter()
    .append("div")
    .attr("class", (d) => "legend--item " + [d]);

  drawLegend();

  function drawLegend() {
      const lineLength = 
        config.legendItemWidth - 20 - (config.legendLabels.min.length * char_width) - (config.legendLabels.max.length * char_width)

    var_group = d3
      .select("#legend")
      .selectAll("div.legend--item.Inc")
      .append("svg")
      .attr("height", config.legendHeight)
      .attr("width", config.legendItemWidth)
      .append("g")
      .attr("class","legendContent")
    var_group2 = d3
      .select("#legend")
      .selectAll("div.legend--item.Dec")
      .append("svg")
      .attr("height", config.legendHeight)
      .attr("width", config.legendItemWidth)
      .append("g")
      .attr("class","legendContent")
    var_group3 = d3
      .select("#legend")
      .selectAll("div.legend--item.No")
      .append("svg")
      .attr("height", config.legendHeight)
      .attr("width", config.legendItemWidth)
      .append("g")
      .attr("class","legendContent")

      //Increase legend item
      var_group
        .append("text")
        .attr("y", 30)
        .attr("x", 0)
        .attr("text-anchor", "start")
        .attr("class", "mintext legendLabel")
        .attr("fill", config.colour_palette[0])
        .text(config.legendLabels.min);

      //this measures how wide the "min" value is so that we can place the legend items responsively
      let minTextWidth = d3.select("text.mintext").node().getBBox().width + 5;

      var_group
        .append("line")
        .attr("stroke", config.colour_palette[0])
        .attr("stroke-width", "3px")
        .attr("y1", 26)
        .attr("y2", 26)
        .attr("x1", minTextWidth)
        .attr("x2", minTextWidth + lineLength)
        .attr("marker-end", "url(#annotation_arrowhead_right)");

      var_group
        .append("text")
        .attr("y", 30)
        .attr(
          "x",
          minTextWidth +
            lineLength +
            config.dotSize +
            5
        )
        .attr("text-anchor", "start")
        .attr("class", "maxtext legendLabel")
        .attr("fill", config.colour_palette[0])
        .text(config.legendLabels.max);

      //this measures how wide the "max" value is so that we can place the legend items responsively
      let maxTextWidth = d3.select("text.maxtext").node().getBBox().width + 5;

      var_group
        .append("text")
        .attr("y", 10)
        .attr(
          "x",
          (minTextWidth +
            lineLength +
            config.dotSize +
            maxTextWidth) /
            2
        )
        .attr("text-anchor", "middle")
        .attr("class", "legendLabel")
        .attr("fill", config.colour_palette[0])
      .text(config.legendText[0]);

    //Decrease legend item
    var_group2
      .append("line")
      .attr("stroke", config.colour_palette[1])
      .attr("stroke-width", "3px")
      .attr("y1", 26)
      .attr("y2", 26)
      .attr(
        "x1",
        maxTextWidth +
          config.dotSize +
          lineLength
      )
      .attr("x2", maxTextWidth + config.dotSize)
      .attr("marker-end", "url(#annotation_arrowhead_left)");

    var_group2
      .append("text")
      .attr("y", 30)
      .attr("x", 0)
      .attr("text-anchor", "start")
      .attr("class", "legendLabel")
      .attr("fill", config.colour_palette[1])
      .text(config.legendLabels.max);

    var_group2
      .append("text")
      .attr("y", 30)
      .attr(
        "x",
        maxTextWidth +
          lineLength +
          config.dotSize +
          5
      )
      .attr("text-anchor", "start")
      .attr("class", "legendLabel")
      .attr("fill", config.colour_palette[1])
      .text(config.legendLabels.min);

    var_group2
      .append("text")
      .attr("y", 10)
      .attr(
        "x",
        (maxTextWidth +
          lineLength +
          config.dotSize +
          minTextWidth) /
          2
      )
      .attr("text-anchor", "middle")
      .attr("class", "legendLabel")
      .attr("fill", config.colour_palette[1])
      .text(config.legendText[1]);

    //No contribution to change legend item
    var_group3
      .append("circle")
      .attr("id","noChangeLegendCircle")
      .attr("r", config.dotSize)
      .attr("fill", config.colour_palette[2])
      .attr("cx", config.legendItemWidth/2)
      .attr("cy", 26);

    var_group3
      .append("text")
      .attr("y", 10)
      .attr("x", config.legendItemWidth/2)
      .attr("text-anchor", "middle")
      .attr("class", "legendLabel")
      .attr("id","noChangeLegendText")
      .attr("fill", config.colour_palette[2])
      .text(config.legendText[2])
      .call(wrap,config.legendItemWidth)

    if(size != "sm"){
      let numberOfLines = document.getElementById("noChangeLegendText").childElementCount
      let lineHeight = 19.2

      d3.select("#noChangeLegendText").attr("dy",(numberOfLines-1)*-lineHeight/2)
      // d3.select("#noChangeLegendCircle").attr("cy", (numberOfLines-1)*lineHeight + 26)
      d3.selectAll(".legendContent").attr("transform","translate(0,"+(numberOfLines-1)*lineHeight+")")
    }


    d3.select()
  } //End drawLegend

  //create link to source
  d3.select("#source").text("Source: " + config.sourceText);

  //use pym to calculate chart dimensions
  if (pymChild) {
    pymChild.sendHeight();
  }
}

d3.csv(config.graphic_data_url).then((data) => {
  //load chart data
  graphic_data = data;

  //use pym to create iframed chart dependent on specified variables
  pymChild = new pym.Child({
    renderCallback: drawGraphic,
  });
});
