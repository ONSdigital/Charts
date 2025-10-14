import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Nest the graphicData by the 'series' column
	let nested_data = d3.group(graphicData, (d) => d.series);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	let xDataType;

	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// console.log(xDataType)

	function drawChart(container, seriesName, data, chartIndex) {

		const chartEvery = config.chartEvery[size];
		const chartsPerRow = config.chartEvery[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.margin[size] };
		let chartGap = config.optional?.chartGap || 10;

		let chart_width = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: chartsPerRow,
			chartMargin: margin,
			chartGap: chartGap
		})

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = chartGap;
			}
		}

		const aspectRatio = config.aspectRatio[size];
		// let chart_width = calculateChartWidth(size)

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
			.domain(graphicData.columns.slice(2))
			.range(config.colourPalette);

		//use the data to find unique entries in the date column
		x.domain([...new Set(graphicData.map((d) => d.date))]);

		//set up yAxis generator
		const yAxis = d3.axisLeft(y)
			.tickSize(-chart_width)
			.tickPadding(10)
			.ticks(config.yAxisTicks[size])
			.tickFormat((d) => config.dropYAxis !== true ? d3.format(config.yAxisTickFormat)(d) :
				chartPosition == 0 ? d3.format(config.yAxisTickFormat)(d) : "");

		const stack = d3
			.stack()
			.keys(graphicData.columns.slice(2))
			.offset(d3[config.stackOffset])
			.order(d3[config.stackOrder]);

		const series = stack(data);
		const seriesAll = stack(graphicData);

		let xTime = d3.timeFormat(config.xAxisTickFormat[size])

		//set up xAxis generator
		const xAxis = d3
			.axisBottom(x)
			.tickSize(10)
			.tickPadding(10)
			.tickValues(xDataType == 'date' ? graphicData
				.map(function (d) {
					return d.date.getTime()
				}) //just get dates as seconds past unix epoch
				.filter(function (d, i, arr) {
					return arr.indexOf(d) == i
				}) //find unique
				.map(function (d) {
					return new Date(d)
				}) //map back to dates
				.sort(function (a, b) {
					return a - b
				})
				.filter(function (d, i) {
					return i % config.xAxisTicksEvery[size] === 0 && i <= graphicData.length - config.xAxisTicksEvery[size] || i == data.length - 1 //Rob's fussy comment about labelling the last date
				}) : x.domain().filter((d, i) => { return i % config.xAxisTicksEvery[size] === 0 && i <= graphicData.length - config.xAxisTicksEvery[size] || i == data.length - 1 })
			)
			.tickFormat((d) => xDataType == 'date' ? xTime(d)
				: d3.format(config.xAxisNumberFormat)(d));

		// //Labelling the first and/or last bar if needed
		// if (config.showStartEndDate == true) {
		// 	xAxis.tickValues(x.domain().filter(function (d, i) {
		// 		return !(i % config.xAxisTicksEvery[size])
		// 	}).concat(x.domain()[0], x.domain()[x.domain().length - 1]))
		// }

		//create svg for chart
		svg = addSvg({
			svgParent: container,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

		if (config.yDomain == 'auto') {
			y.domain(d3.extent(seriesAll.flat(2))); //flatten the arrays and then get the extent
		} else {
			y.domain(config.yDomain);
		}

		//Getting the list of colours used in this visualisation
		let colours = [...config.colourPalette].slice(0, graphicData.columns.slice(2).length)

		// Set up the legend
		let legenditem = d3
			.select('#legend')
			.selectAll('div.legend--item')
			.data(
				d3.zip(graphicData.columns.slice(2).reverse(), colours.reverse())
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

		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -30,
			text: seriesName,
			wrapWidth: chart_width
		})

		// This does the y-axis label
		addAxisLabel({
			svgContainer: svg,
			xPosition: 5 - margin.left,
			yPosition: -10,
			text: chartIndex % chartEvery == 0 ? config.yAxisLabel : "",
			textAnchor: "start",
			wrapWidth: chart_width
		});
	};

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
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
