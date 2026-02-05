import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let pymChild = null;
let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let size, graphicData;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Group the data by the 'series' column
	const nestedData = d3.groups(graphicData, (d) => d.series);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nestedData))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {
		const chartsPerRow = config.chartEvery[size];
		const chartPosition = chartIndex % chartsPerRow;

		// Set dimensions
		let margin = { ...config.margin[size] };
		let chartGap = config?.chartGap || 10;

		// Calculate chart width here
		let chartWidth = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: chartsPerRow,
			chartMargin: margin,
			chartGap: chartGap
		});

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = chartGap;
			}
		}

		// Get categories from the keys used in the stack generator
		const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date' && k !== 'series');

		const colorScale = d3
			.scaleOrdinal()
			.domain(categories)
			.range(config.colourPalette);

		//Getting the list of colours used in this visualisation
		let colours = [...config.colourPalette].slice(0, categories.length)

		// Set up the legend
		const legenditem = legend
			.selectAll('div.legend--item')
			.data(
				d3.zip([...categories].reverse(), colours.reverse())
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
		//End of legend code


		let height =
			chartWidth * (config.aspectRatio[size][1] / config.aspectRatio[size][0]) - margin.top - margin.bottom;

		// Define the x and y scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(graphicData, (d) => d.date))
			.range([0, chartWidth]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(graphicData, (d) => d3.sum(categories, (c) => d[c]))])
			.range([height, 0]);

		// Define the stack generator
		const stack = d3.stack()
			.keys(categories)
			.order(d3[config.stackOrder]) // Use the stack order defined in the config
			.offset(d3[config.stackOffset]); // Convert to percentage values

		// Create an SVG for this chart
		const svg = addSvg({
			svgParent: graphic,
			chartWidth: chartWidth,
			height: height + margin.top + margin.bottom,
			margin: margin
		})
console.log(data)
console.log(stack(data))
		// Add the areas
		svg
			.selectAll('.area')
			.data(stack(data))
			.enter()
			.append('path')
			.attr('class', 'area')
			.attr(
				'd',
				d3
					.area()
					.x((d) => x(d.data.date))
					.y0((d) => y(d[0]))
					.y1((d) => y(d[1]))
			)
			.attr('fill', (d) => colorScale(d.key));

		// Add the x-axis
		svg
			.append('g')
			.attr('class', 'axis numeric')
			.attr('transform', `translate(0, ${height})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(data
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
							return i % config.xAxisTicksEvery[size] === 0 && i <= graphicData.length - config.xAxisTicksEvery[size] || i == graphicData.length - 1 //Rob's fussy comment about labelling the last date
						})
					)
					.tickFormat(d3.timeFormat(config.xAxisTickFormat[size]))
			);


		//Add the y-axis to the leftmost chart, or all charts if dropYAxis in the config is false
		svg
			.append('g')
			.attr('class', 'y axis numeric')
			.call(d3.axisLeft(y)
				.tickSize(calculateTickSize())
				.tickFormat((d) => config.dropYAxis !== true ? d3.format(config.yAxisFormat)(d) :
					chartPosition == 0 ? d3.format(config.yAxisFormat)(d) : ""));

		function calculateTickSize() {
			if (config.dropYAxis) {
				if (chartPosition == 0) {
					return 5
				} else {
					return 0
				}
			} else {
				return 5
			}
		}

		// Add a title to each of the charts 
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 2,
			text: seriesName,
			wrapWidth: chartWidth
		})

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: chartWidth,
				yPosition: height + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chartWidth
			});
		}

		// This does the y-axis label
		addAxisLabel({
			svgContainer: svg,
			xPosition: -(margin.left - 5),
			yPosition: -10,
			text: chartPosition == 0 ? config.yAxisLabel : "",
			textAnchor: "start",
			wrapWidth: chartWidth
		});
	}
	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
	});

	//create link to source
	addSource('source', config.sourceText);

	// Send the height to the parent frame
	if (pymChild) {
		pymChild.sendHeight();
	}
}

// Load the data
d3.csv(config.graphicDataURL)
	.then((data) => {
		graphicData = data;
		graphicData.forEach((d) => {
			d.date = d3.utcParse(config.dateFormat)(d.date);
		});

		//use pym to create iframed chart dependent on specified variables
		pymChild = new pym.Child({
			renderCallback: drawGraphic
		});

	})
