import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addAxisLabel,addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Nest the graphicData by the 'series' column
	let nestedData = d3.groups(graphicData, (d) => d.group);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...nestedData][0][1].map(d => d.name);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nestedData))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {
		// Log the data being used for each small multiple
		// console.log('Data for this small multiple:', data);
		// console.log(chartIndex);

		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

		// Calculate the height based on the data
		let height = config.seriesHeight[size] * data.length +
			10 * (data.length - 1) +
			12;


		let chartsPerRow = config.chartEvery[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.margin[size] };
		let chartGap = config.optional?.chartGap || 10;

		let chartWidth = calculateChartWidth({
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
		const x = d3.scaleLinear().range([0, chartWidth]);

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
			chartWidth: chartWidth,
			height: height + margin.top + margin.bottom,
			margin: margin
		})

		if (config.xDomain == 'auto') {
			if (d3.min(graphicData.map(({ value }) => Number(value))) >= 0) {
				x.domain([
					0,
					d3.max(graphicData.map(({ value }) => Number(value)))]); //modified so it converts string to number
			} else {
				x.domain(d3.extent(graphicData.map(({ value }) => Number(value))))
			}
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
			.attr('y', (d) => y(d.name))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', y.bandwidth())
			.attr('fill', config.colourPalette);

		if (config.dataLabels.show == true) {
			addDataLabels({
				svgContainer: svg,
				data: data,
				chartWidth: chartWidth,
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
			wrapWidth: chartWidth
		})

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nestedData].length - 1) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: chartWidth,
				yPosition: height + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chartWidth
				});
		}
	}

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
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
