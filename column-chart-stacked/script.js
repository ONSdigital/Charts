import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	const aspectRatio = config.aspectRatio[size];
	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by the aspect ratio
	let height =
		aspectRatio[1] / aspectRatio[0] * chart_width;


	//set up scales
	const y = d3.scaleLinear().range([height, 0]);

	const x = d3
		.scaleBand()
		.paddingOuter(0.0)
		.paddingInner(0.1)
		.range([0, chart_width])
		.round(false);

	const colour = d3
		.scaleOrdinal()
		.domain(graphic_data.columns.slice(1))
		.range(config.colourPalette);

	//use the data to find unique entries in the date column
	x.domain([...new Set(graphic_data.map((d) => d.date))]);

	let tickValues = x.domain().filter(function (d, i) {
		return !(i % config.xAxisTicksEvery[size])
	});

	//Labelling the first and/or last bar if needed
	if (config.addFirstDate == true) {
		tickValues.push(graphic_data[0].date)
		console.log("First date added")
	}

	if (config.addFinalDate == true) {
		tickValues.push(graphic_data[graphic_data.length - 1].date)
		console.log("Last date added")
	}

	//set up yAxis generator
	let yAxis = d3.axisLeft(y)
		.tickSize(-chart_width)
		.tickPadding(10)
		.ticks(config.yAxisTicks[size])
		.tickFormat(d3.format(config.yAxisTickFormat));

	const stack = d3
		.stack()
		.keys(graphic_data.columns.slice(1))
		.offset(d3[config.stackOffset])
		.order(d3[config.stackOrder]);

	const series = stack(graphic_data);

	let xDataType;

	if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// console.log(xDataType)

	let xTime = d3.timeFormat(config.xAxisTickFormat[size])

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(10)
		.tickPadding(10)
		.tickValues(tickValues) //Labelling the first and/or last bar if needed
		.tickFormat((d) => xDataType == 'date' ? xTime(d)
			: d3.format(config.xAxisNumberFormat)(d));

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	if (config.yDomain == 'auto') {
		y.domain(d3.extent(series.flat(2))); //flatten the arrays and then get the extent
	} else {
		y.domain(config.yDomain);
	}

	//Getting the list of colours used in this visualisation
	let colours = [...config.colourPalette].slice(0, graphic_data.columns.slice(1).length)

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphic_data.columns.slice(1).reverse(), colours.reverse())
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

	if (size !== 'sm') {
		d3.select('#legend')
			.style('grid-template-columns', `repeat(${config.legendColumns}, 1fr)`)
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
		.attr('width', x.bandwidth());


	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -10,
		text: config.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
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
	graphic_data = data;

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
