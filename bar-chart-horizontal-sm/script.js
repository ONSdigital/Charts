import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addAxisLabel,addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.groups(graphic_data, (d) => d.series);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...nested_data][0][1].map(d => d.name);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {
		// Log the data being used for each small multiple
		// console.log('Data for this small multiple:', data);
		// console.log(chartIndex);

		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		// Calculate the height based on the data
		let height = config.optional.seriesHeight[size] * data.length +
			10 * (data.length - 1) +
			12;


		let chartsPerRow = config.optional.chart_every[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.optional.margin[size] };
		let chartGap = config.optional?.chartGap || 10;

		let chart_width = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: chartsPerRow,
			chartMargin: margin,
			chartGap: chartGap
		})

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.optional.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = chartGap;
			}
		}

		//set up scales
		const x = d3.scaleLinear().range([0, chart_width]);

		const y = d3
			.scaleBand()
			.paddingOuter(0.2)
			.paddingInner(((data.length - 1) * 10) / (data.length * 30))
			.range([0, height])
			.round(true);

		//use the data to find unique entries in the name column
		y.domain([...new Set(data.map((d) => d.name))]);

		//set up yAxis generator - if dropYAxis is true only adding labels to the leftmost chart
		let yAxis = d3.axisLeft(y)
			.tickSize(0)
			.tickPadding(10)
			.tickFormat((d) => config.optional.dropYAxis !== true ? (d) :
				chartPosition == 0 ? (d) : "");

		//set up xAxis generator
		let xAxis = d3
			.axisBottom(x)
			.tickSize(-height)
			.tickFormat(d3.format(config.essential.dataLabels.numberFormat))
			.ticks(config.optional.xAxisTicks[size]);

		//create svg for chart
		svg = addSvg({
			svgParent: container,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

		if (config.essential.xDomain == 'auto') {
			if (d3.min(graphic_data.map(({ value }) => Number(value))) >= 0) {
				x.domain([
					0,
					d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
			} else {
				x.domain(d3.extent(graphic_data.map(({ value }) => Number(value))))
			}
		} else {
			x.domain(config.essential.xDomain);
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
			.attr('y', (d) => y(d.name))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', y.bandwidth())
			.attr('fill', config.essential.colour_palette);

		if (config.essential.dataLabels.show == true) {
			addDataLabels({
				svgContainer: svg,
				data: data,
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: y
			})
		} //end if for datalabels

		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -15,
			text: seriesName,
			wrapWidth: chart_width
		})

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nested_data].length - 1) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: chart_width,
				yPosition: height + 35,
				text: config.essential.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
				});
		}
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
	});

	//create link to source
	addSource('source', config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
