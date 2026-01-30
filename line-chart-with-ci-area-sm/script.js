import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addDirectionArrow, addElbowArrow, addSource, getXAxisTicks } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Get categories from the keys used in the stack generator
	// const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date');
	const categories = Object.keys(graphicData[0]).filter(d => !d.endsWith('_lowerCI') && !d.endsWith('_upperCI')).slice(1).filter((k) => k !== 'series')
	const fulldataKeys = Object.keys(graphicData[0]).slice(1).filter((k) => k !== 'series')

	let xDataType;

	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}
	// Nest the graphicData by the 'series' column
	let nestedData = d3.group(graphicData, (d) => d.series);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nestedData))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {

		const chartEvery = config.chartEvery[size];
		const chartsPerRow = config.chartEvery[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.margin[size] };

		let chartGap = config.optional?.chartGap || 10;

		let chartWidth = calculateChartWidth({
			screenWidth: parseInt(graphic.style('width')),
			chartEvery: chartsPerRow,
			chartMargin: margin,
			chartGap: chartGap
		})

		if (chartPosition !== 0) {
			margin.left = chartGap;
		}

		const aspectRatio = config.aspectRatio[size];

		//height is set by the aspect ratio
		var height =
			aspectRatio[1] / aspectRatio[0] * chartWidth;

		// Define the x and y scales
		const x = d3
			.scaleTime()
			.domain(d3.extent(graphicData, (d) => d.date))
			.range([0, chartWidth]);


		const y = d3
			.scaleLinear()
			.domain([
				d3.min(graphicData, (d) => Math.min(...fulldataKeys.map((c) => d[c]))),
				d3.max(graphicData, (d) => Math.max(...fulldataKeys.map((c) => d[c])))
			])
			// .nice()
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
				.attr('stroke-width', 2.5)
				.attr('d', lineGenerator)
				.style('stroke-linejoin', 'round')
				.style('stroke-linecap', 'round')
				.attr('class', 'line' + categories.indexOf(category));

			const areaGenerator = d3.area()
				.x(d => x(d.date))
				.y0(d => y(d[`${category}_lowerCI`]))
				.y1(d => y(d[`${category}_upperCI`]))
				.defined(d => d[`${category}_lowerCI`] !== null && d[`${category}_upperCI`] !== null) // Only plot areas where we have values

			svg.append('path')
				.attr('class', 'shaded')
				.attr('d', areaGenerator(data))
				.attr('fill', config.colourPalette[
					categories.indexOf(category) % config.colourPalette.length
				])
				.attr('opacity', 0.15)

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

		// Use new getXAxisTicks function for tick values
		let tickValues = getXAxisTicks({
			data: data,
			xDataType,
			size,
			config
		});

		// Add the x-axis
		svg
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${height})`)
			.call(
				d3
					.axisBottom(x)
					.tickValues(tickValues)
					.tickFormat((d) => xDataType === 'date'
						? d3.timeFormat(config.xAxisTickFormat[size])(d)
						: d3.format(config.xAxisNumberFormat)(d))
			);


		//If dropYAxis == true Only draw the y axis tick labels on the first chart in each row
		svg
			.append('g')
			.attr('class', 'y axis numeric')
			.call(d3.axisLeft(y)
				.ticks(config.yAxisTicks[size])
				.tickFormat((d) => config.dropYAxis !== true ? d3.format(config.yAxisFormat)(d) :
					chartPosition == 0 ? d3.format(config.yAxisFormat)(d) : ""))
			.selectAll('.tick text')
			.call(wrap, margin.left - 10);


		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 2,
			text: seriesName,
			wrapWidth: (chartWidth + margin.right)
		})


		// This does the y-axis label
		addAxisLabel({
			svgContainer: svg,
			xPosition: -margin.left,
			yPosition: -15,
			text: chartIndex % chartEvery == 0 ?
				config.yAxisLabel : "",
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

	if (config.ciLegend) {

		const ciSvg = d3.select('#legend')
			.append('div')
			.attr('class', 'legend--item')
			.append('svg')
			.attr('width', 205)
			.attr('height', 70);

		ciSvg.append('rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', 50)
			.attr('height', 25)
			.attr('fill', "#959495")
			.attr('fill-opacity', 0.3);

		ciSvg.append('line')
			.attr('x1', 0)
			.attr('y1', 12.5)
			.attr('x2', 50)
			.attr('y2', 12.5)
			.attr('stroke', "#666666")
			.attr('stroke-width', 2);

		addElbowArrow(
			ciSvg,                // svgName
			25,                   // startX
			25,                   // startY
			68,                   // endX
			37,                    // endY
			"vertical-first",     // bendDirection
			"start",                // arrowAnchor
			config.legendIntervalText, // thisText
			150,                  // wrapWidth
			25,                   // textAdjustY
			"top",               // wrapVerticalAlign
			"#414042",            // arrowColour
			"end"              // textAlignment
		)

		addDirectionArrow(
			//name of your svg, normally just SVG
			ciSvg,
			//direction of arrow: left, right, up or down
			'left',
			//anchor end or start (end points the arrow towards your x value, start points away)
			'end',
			//x value
			50,
			//y value
			7,
			//alignment - left or right for vertical arrows, above or below for horizontal arrows
			'right',
			//annotation text
			config.legendEstimateText,
			//wrap width
			1500,
			//text adjust y
			0,
			//Text vertical align: top, middle or bottom (default is middle)
			'bottom'
		)


	}


	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

// Load the data
d3.csv(config.graphicDataURL).then((rawData) => {
	graphicData = rawData.map((d) => {
		return {
			date: d3.timeParse(config.dateFormat)(d.date),
			...Object.entries(d)
				.filter(([key]) => key !== 'date')
				.map(([key, value]) => key !== "series" ? [key, value == "" ? null : +value] : [key, value]) // Checking for missing values so that they can be separated from zeroes
				.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
		};
	});

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});

// window.onresize = drawGraphic