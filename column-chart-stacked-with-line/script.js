import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
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

	//set up yAxis generator
	let yAxis = d3.axisLeft(y)
		.tickSize(-chartWidth)
		.tickPadding(10)
		.ticks(config.yAxisTicks[size])
		.tickFormat(d3.format(config.yAxisTickFormat));

	let xDataType;

	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// console.log(xDataType)

	let xTime = d3.timeFormat(config.xAxisTickFormat[size])

	let tickValues = x.domain().filter(function (d, i) {
		return !(i % config.xAxisTicksEvery[size])
	});

	//Labelling the first and/or last bar if needed
	if (config.addFirstDate == true) {
		tickValues.push(graphicData[0].date)
		console.log("First date added")
	}

	if (config.addFinalDate == true) {
		tickValues.push(graphicData[graphicData.length - 1].date)
		console.log("Last date added")
	}

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(10)
		.tickPadding(10)
		.tickValues(tickValues)
		.tickFormat((d) => xDataType == 'date' ? xTime(d)
			: d3.format(config.xAxisNumberFormat)(d));

	const stack = d3
		.stack()
		.keys(graphicData.columns.slice(1).filter(d => (d) !== config.lineSeries))
		.offset(d3[config.stackOffset])
		.order(d3[config.stackOrder]);

	let series = stack(graphicData);

	//gets array of arrays for individual lines
	let lines = [];
	for (let column in graphicData[0]) {
		if (column == 'date') continue;
		lines[column] = graphicData.map(function (d) {
			return {
				'name': d.date,
				'amt': d[column]
			};
		});
	}


	// console.log("linesflat: ", Object.entries(lines).flat(3))

	let counter;
	// do some code to overwrite blanks with the last known point
	let keys = Object.keys(lines);
	for (let i = 0; i < keys.length; i++) {
		// console.log(lines[keys[i]])
		lines[keys[i]].forEach(function (d, j) {
			if (d.amt != "null") {
				counter = j;
			} else {
				d.name = lines[keys[i]][counter].name
				d.amt = lines[keys[i]][counter].amt
			}

		})

	}

	// console.log("keys: ", keys)

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphicData.columns.slice(1).filter(d => (d) !== config.lineSeries), config.colourPalette)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', 'legend--icon--circle')
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

	d3.select('#legend')
		.append('div')
		.attr('class', 'legend--item line')
		.append('div')
		.attr('class', 'legend--icon--refline')
		.style('background-color', config.lineColour);

	d3.select('.legend--item.line')
		.append('div')
		.attr('class', 'legend--text')
		.text(config.lineSeries)


	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	if (config.yDomain == 'auto') {
		// y.domain([
		// 	0,
		// 	d3.max(graphicData, (d) => d3.max(keys, (c) => d[c]))])
		y.domain(d3.extent(series.flat(2)));
	} else {
		y.domain(config.yDomain);
	}

	svg
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		.call(xAxis);

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
		.append('g')
		.selectAll('g')
		.data(series)
		.join('g')
		.attr('fill', (d, i) => config.colourPalette[i])
		.selectAll('rect')
		.data((d) => d)
		.join('rect')
		.attr('y', (d) => Math.min(y(d[0]), y(d[1])))
		.attr('x', (d) => x(d.data.date))
		.attr('height', (d) => Math.abs(y(d[0]) - y(d[1])))
		.attr('width', x.bandwidth())
	// .attr('fill', config.colourPalette[0]);


	let thisCurve = d3.curveLinear

	let line = d3.line()
		.defined((d) => d.amt !== 'null')
		.curve(thisCurve)
		.x((d) => x(d.name))
		.y((d) => y(d.amt));
	// //     //opposite sex

	let lineValues = Object.entries(lines).filter(d => d[0] == config.lineSeries)

	// console.log("lines: ", lines)
	// console.log("Object.entries(lines)", Object.entries(lines))
	// console.log("filtered lines: ", Object.entries(lines).filter(d => d[0] == config.lineSeries))

	svg.append('g')
		.selectAll('path')
		.data(lineValues)
		.enter()
		.append('path')
		.attr("stroke", (d, i) => config.lineColour)
		.attr("class", "dataLine")
		.attr('d', (d) =>
			line(d[1]))
		.attr("transform", "translate(" + x.bandwidth() / 2 + ",0)");

	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -10,
		text: config.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chartWidth
	});

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.graphicDataURL).then((data) => {
	//load chart data
	graphicData = data;

	let parseTime = d3.timeParse(config.dateFormat);

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
