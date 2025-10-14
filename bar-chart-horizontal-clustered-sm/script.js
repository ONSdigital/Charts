import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let legendCategories = [...new Set(graphicData.map((d) => d.category))]

	//Set up the legend
	let legendItem = legend
		.selectAll('div')
		.data(legendCategories)
		.join('div')
		.attr('class', 'legend--item')

	legendItem
		.append('div')
		.attr('class', 'legend--icon--circle')
		.style('background-color', (d, i) => config.colourPalette[i])

	legendItem
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.text(d => d)

	// Nest the graphicData by the 'series' column
	let nested_data = d3.group(graphicData, (d) => d.series);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...new Set([...nested_data][0][1].map(d => d.name))];
	// console.log(namesArray)

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, chartIndex) {

		// console.log(chartIndex);

		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		// Log the data being used for each small multiple
		// console.log('Data for this small multiple:', data);

		// Calculate the height based on the data
		let height = config.seriesHeight[size] * namesArray.length +
			10 * (namesArray.length - 1) +
			12;


		let chartsPerRow = config.chart_every[size];
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


		//set up scales
		const x = d3.scaleLinear().range([0, chart_width]);

		const y = d3
			.scaleBand()
			.paddingOuter(0.1)
			.paddingInner(0.2)
			.range([0, height])
			.round(true);

		//use the data to find unique entries in the name column
		y.domain([...new Set(data.map((d) => d.name))]);


		const y2 = d3
			.scaleBand()
			.paddingOuter(0)
			.paddingInner(0)
			.range([0, y.bandwidth()])
			.round(true);

		//use the data to find unique entries in the category column
		y2.domain(legendCategories);
		// console.log(y2.domain())

		//set up yAxis generator

		let yAxis = d3.axisLeft(y)
			.tickSize(0)
			.tickPadding(10)
			.tickFormat((d) => config.dropYAxis !== true ? (d) :
				chartPosition == 0 ? (d) : "");

		//set up xAxis generator
		let xAxis = d3
			.axisBottom(x)
			.tickSize(-height)
			.tickFormat(d3.format(config.dataLabels.numberFormat))
			.ticks(config.xAxisTicks[size]);

		//create svg for chart
		svg = addSvg({
			svgParent: container,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

		if (config.xDomain == 'auto') {
			x.domain([
				Math.min(0, d3.min(graphicData.map(({ value }) => Number(value)))),
				//x domain is the maximum out of the value and the reference value
				Math.max(0, d3.max(graphicData.map(({ value }) => Number(value))))
			])
		} else {
			x.domain(config.xDomain);
		}

		svg
			.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'x axis')
			.call(xAxis)
			.selectAll('line')
			.each(function (d) {
				if (d == 0) {
					d3.select(this).attr('class', 'zero-line');
				}
			});

		// if (chartPosition == 0) {
		svg
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.selectAll('text')
			.call(wrap, margin.left - 10);
		// }


		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => y(d.name) + y2(d.category))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', y2.bandwidth())
			.attr('fill', (d) => config.colourPalette[legendCategories.indexOf(d.category)]);

		if (config.dataLabels.show == true && legendCategories.length <= 2) {
			addDataLabels({
				svgContainer: svg,
				data: data,
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: y,
				y2function: y2
			})
		} //end if for datalabels

		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -15,
			text: d => d[0],
			wrapWidth: chart_width
		})

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nested_data].length - 1) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: chart_width,
				yPosition: height + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), value, i);
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

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});