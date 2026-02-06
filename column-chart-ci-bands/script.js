import { initialise, wrap, addSvg, addAxisLabel, addSource, customTemporalAxis } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

    //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
    size = initialise(size);

    const aspectRatio = config.aspectRatio[size];
    let margin = config.margin[size];
    let chartWidth =
        parseInt(graphic.style('width')) - margin.left - margin.right;
    //height is set by the aspect ratio
    let height =
        aspectRatio[1] / aspectRatio[0] * chartWidth;

    //set up scales
    const y = d3.scaleLinear().range([height, 0]);

    const x = d3
        .scaleBand()
        .paddingOuter(0.0)
        .paddingInner(0.1)
        .range([0, chartWidth])
        .round(false);

    //use the data to find unique entries in the date column
    x.domain([...new Set(graphicData.map((d) => d.date))]);

    // determine what type of variable xvalue is
    let xDataType;

    if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
        xDataType = 'date';
    } else if (!isNaN(Number(graphicData[0].date))) {
        xDataType = 'numeric';
    } else {
        xDataType = 'categorical';
    }

    // If xvalue is categorical, show all values, else use the config number of ticks
    let tickValues

    if (xDataType === 'categorical') {
        tickValues = x.domain()
    }
    else {
        tickValues = x.domain().filter(function (d, i) {
            return !(i % config.xAxisTicksEvery[size])
        })
    }

    //Labelling the first and/or last bar if needed
    if (config.addFirstDate == true) {
        tickValues.push(graphicData[0].date)
    }

    if (config.addFinalDate == true) {
        tickValues.push(graphicData[graphicData.length - 1].date)
    }

    //set up yAxis generator
    let yAxis = d3.axisLeft(y)
        .tickSize(-chartWidth)
        .tickPadding(10)
        .ticks(config.yAxisTicks[size])
        .tickFormat(d3.format(config.yAxisTickFormat));


    let xTime = d3.timeFormat(config.xAxisTickFormat[size])

    //set up xAxis generator
	let xAxisGenerator;
	if (config.labelSpans.enabled === true && xDataType=="date") {
		xAxisGenerator = customTemporalAxis(x)
            .timeUnit(config.labelSpans.timeUnit)
            .tickSize(0)
            .tickPadding(6)
            .secondaryTimeUnit(config.labelSpans.secondaryTimeUnit);
	} else {
		xAxisGenerator = d3
			.axisBottom(x)
			.tickSize(10)
			.tickPadding(10)
			.tickValues(tickValues) //Labelling the first and/or last bar if needed
			.tickFormat((d) => xDataType == 'date' ? xTime(d)
				: d3.format(config.xAxisNumberFormat)(d));
	}

    //create svg for chart
    svg = addSvg({
        svgParent: graphic,
        chartWidth: chartWidth,
        height: height + margin.top + margin.bottom,
        margin: margin
    })

    // set ydomain based on max upperBound and min lowerBound
    if (config.yDomain == 'auto') {
        if (d3.min(graphicData.map(({ lowerBound }) => Number(lowerBound))) >= 0) {
            y.domain([
                0,
                d3.max(graphicData.map(({ upperBound }) => Number(upperBound)))]); //modified so it converts string to number
        } else {
            y.domain([
                d3.min(graphicData.map(({ lowerBound }) => Number(lowerBound))),
                d3.max(graphicData.map(({ upperBound }) => Number(upperBound)))
            ])
        }
    } else {
        y.domain(config.yDomain);
    }

    svg
        .append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxisGenerator);

    svg
        .append('g')
        .attr('class', 'y axis numeric')
        .call(yAxis)
        .selectAll('line')
        .each(function (d) {
            if (d == 0) {
                d3.select(this).attr('class', 'zero-line');
            }
        })
        .selectAll('text')
        .call(wrap, margin.left - 10);

    svg
        .selectAll('rect')
        .data(graphicData)
        .join('rect')
        .attr('y', (d) => y(d.upperBound))
        .attr('x', (d) => x(d.date))
        .attr('height', (d) => Math.abs(y(d.upperBound) - y(d.lowerBound)))
        .attr('width', x.bandwidth())
        .attr('fill', config.colourPalette)
        .attr("opacity", 0.65);

    svg
        .selectAll('estLine')
        .data(graphicData)
        .attr("class", "estLine")
        .join('line')
        .attr('x1', (d) => x(d.date))
        .attr('x2', (d) => x(d.date) + x.bandwidth())
        .attr('y1', (d) => y((d.value)))
        .attr('y2', (d) => y((d.value)))
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'butt')
        .attr('stroke', config.lineColour)
        .attr('fill', 'none');

    // This does the x-axis label
    addAxisLabel({
        svgContainer: svg,
        xPosition: chartWidth,
        yPosition: height + 55,
        text: config.xAxisLabel,
        textAnchor: "end",
        wrapWidth: chartWidth
    });

    // This does the y-axis label
    addAxisLabel({
        svgContainer: svg,
        xPosition: 5 - margin.left,
        yPosition: -20,
        text: config.yAxisLabel,
        textAnchor: "start",
        wrapWidth: chartWidth
    });

    // Set up the legend

    // add confidence interval into legend as seperate div 
    var legenditemCI = d3.select('#legend')
        .selectAll('div.legend--item2')
        .data(d3.zip(0)) // creating a filler for the div to read in. 0 is meaningless
        .enter()
        .append('div')
        .attr('class', 'legend--itemCI')

    legenditemCI.append('div')
        .attr('class', 'legend--icon--rect')
        .style('background-color', config.colourPalette);


    legenditemCI.append('div')
        .append('p')
        .attr('class', 'legend--text')
        .html(config.legendIntervalText);

    var legenditem = d3
        .select('#legend')
        .selectAll('div.legend--item')
        .data(d3.zip(0))
        .enter()
        .append('div')
        .attr('class', 'legend--item');

    legenditem
        .append('div')
        .attr('class', 'legend--icon--estline')
        .style('background-color', config.lineColour)

    legenditem
        .append('div')
        .append('p')
        .attr('class', 'legend--text')
        .html(config.legendEstimateText);


    //create link to source
    addSource('source', config.sourceText);

    //use pym to calculate chart dimensions
    if (pymChild) {
        pymChild.sendHeight();
    }
}

d3.csv(config.graphicDataURL)
    .then((data) => {
        let parseTime = d3.utcParse(config.dateFormat);
        //load chart data
        graphicData = data;

        data.forEach((d, i) => {

            //If the date column is has date data store it as dates
            if (parseTime(data[i].date) !== null) {
                d.date = parseTime(d.date)
            }
        });

        //use pym to create iframed chart dependent on specified variables
        pymChild = new pym.Child({
            renderCallback: drawGraphic
        });
    });
