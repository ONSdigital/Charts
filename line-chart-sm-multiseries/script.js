import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource, getXAxisTicks, customTemporalAxis, calculateAutoBounds } from "../lib/helpers.js";


let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, chartWidth;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date' && k !== 'series');

	// Nest the graphicData by the 'series' column
	let nestedData = d3.group(graphicData, (d) => d.series);

	// console.log(Array.from(nestedData))
	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nestedData))
		.join('div')
		.attr('class', 'chart-container');

	let xDataType;
	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	function drawChart(container, seriesName, data, chartIndex) {

		const chartEvery = config.chartEvery[size];
		const chartsPerRow = config.chartEvery[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.margin[size] };

		let chartGap = config.chartGap || 10;

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.dropYAxis && !config.freeYAxisScales) {

			chartWidth = calculateChartWidth({
				screenWidth: parseInt(graphic.style('width')),
				chartEvery: chartsPerRow,
				chartMargin: margin,
				chartGap: chartGap
			})
			if (chartPosition !== 0) {
				margin.left = chartGap;
			}
		} else {
			chartWidth = ((parseInt(graphic.style('width')) / chartEvery) - margin.left - margin.right);
		}
		// }

		const aspectRatio = config.aspectRatio[size];

		//height is set by the aspect ratio
		var height =
			aspectRatio[1] / aspectRatio[0] * chartWidth;

		// Define the x and y scales
		let x;

		if (xDataType == 'date') {
			x = d3.scaleTime()
				.domain(d3.extent(graphicData, (d) => d.date))
				.range([0, chartWidth]);
		} else {
			x = d3.scaleLinear()
				.domain(d3.extent(graphicData, (d) => +d.date))
				.range([0, chartWidth]);
		}
console.log('data',data, config.freeYAxisScales, config)
		const {minY,maxY} = calculateAutoBounds(config.freeYAxisScales ? data : graphicData, config)
console.log(minY,maxY, chartIndex)
		const y = d3
			.scaleLinear()
			.domain([minY,maxY])
			.nice()
			.range([height, 0]);


		// Create an SVG element
		const svg = addSvg({
			svgParent: container,
			chartWidth: chartWidth,
			height: height + margin.top + margin.bottom,
			margin: margin
		})



		// create lines and circles for each category
		categories.forEach(function (category) {
			const lineGenerator = d3
				.line()
				.x((d) => x(d.date))
				.y((d) => y(d[category]))
				.curve(d3[config.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
				.context(null)
				.defined(d => d[category] !== null) // Only plot lines where we have values

			svg
				.append('path')
				.datum(data)
				.attr('fill', 'none')
				.attr(
					'stroke', /*() => (categories.indexOf(category) == chartIndex) ? "#206095" : "#dadada"*/
					config.colourPalette[
					categories.indexOf(category) % config.colourPalette.length
					]
				)
				.attr('stroke-width', 3)
				.attr('d', lineGenerator)
				.attr('stroke-linejoin', 'round')
				.attr('stroke-linecap', 'round')
				.attr('class', 'line' + categories.indexOf(category));

		});

		// add grid lines to y axis
		svg
			.append('g')
			.attr('class', 'grid')
			.call(
				d3
					.axisLeft(y)
					.ticks(config.yAxisTicks[size])
					.tickSize(-chartWidth)
					.tickFormat('')
			)
			.lower();

		d3.selectAll('g.tick line')
			.each(function (e) {
				if (e == config.zeroLine) {
					d3.select(this).attr('class', 'zero-line');
				}
			})
		// Add the x-axis

		let xAxisGenerator;
		if (config.labelSpans.enabled === true && xDataType == 'date') {
			xAxisGenerator = customTemporalAxis(x)
				.tickSize(17)
				.tickPadding(6)
				.timeUnit(config.labelSpans.timeUnit)
				.secondaryTimeUnit(config.labelSpans.secondaryTimeUnit);
		} else {
			xAxisGenerator = d3
				.axisBottom(x)
				.tickValues(
					getXAxisTicks({
						data: graphicData,
						xDataType,
						size,
						config
					})
				)
				.tickFormat(
					(d) =>
						xDataType == 'date' ?
							d3.timeFormat(config.xAxisTickFormat[size])(d) :
							d3.format(config.xAxisNumberFormat)(d)
				);
		}

		svg
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxisGenerator)


		//If dropYAxis == true Only draw the y axis tick labels on the first chart in each row
		svg
			.append('g')
			.attr('class', 'y axis numeric')
			.call(d3.axisLeft(y)
				.ticks(config.yAxisTicks[size])
				.tickFormat((d) => config.freeYAxisScales ? d3.format(config.yAxisNumberFormat)(d) :
					config.dropYAxis ? (chartPosition == 0 ? d3.format(config.yAxisNumberFormat)(d) : "") :
						d3.format(config.yAxisNumberFormat)(d)).tickSize(0))

			.selectAll('.tick text')
			.call(wrap, margin.left - 10);



		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 1.5,
			text: seriesName,
			wrapWidth: (chartWidth + margin.right)
		});

		// This does the y-axis label
		addAxisLabel({
			svgContainer: svg,
			xPosition: -margin.left,
			yPosition: 35 - margin.top,
			text: config.freeYAxisScales ? config.yAxisLabel :
				chartIndex % chartEvery == 0 ?
					config.yAxisLabel : "", //May need to make the y-axis label an array in the config?
			textAnchor: "start",
			wrapWidth: chartWidth
		});
	}


	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
	});


	// Set up the legend

	var legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(categories, config.colourPalette)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	// Add line icon using SVG
	legenditem
		.append('svg')
		.attr('width', 24)
		.attr('height', 12)
		.append('line')
		.attr('x1', 2)
		.attr('y1', 6)
		.attr('x2', 22)
		.attr('y2', 6)
		.attr('stroke', function (d) { return d[1]; })
		.attr('stroke-linecap', 'round')
		.attr('stroke-width', 3)
		.attr('class', 'legend--icon--line');

	legenditem
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.html(function (d) {
			return d[0];
		});

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
	// console.log(`PymChild height sent`);
}

// Load the data
d3.csv(config.graphicDataURL).then((rawData) => {
	graphicData = rawData.map((d) => {
		if (d3.utcParse(config.dateFormat)(d.date) !== null) {
			return {
				date: d3.utcParse(config.dateFormat)(d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => key !== "series" ? [key, value == "" ? null : +value] : [key, value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		} else {
			return {
				date: (+d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => key !== "series" ? [key, value == "" ? null : +value] : [key, value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		}
	});

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});
