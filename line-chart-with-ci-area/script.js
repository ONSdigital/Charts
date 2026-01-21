//Note: see data.csv for the required data format - the template is quite paticular on the columns ending with _lowerCI and _upperCI

import { initialise, wrap, addSvg, addAxisLabel, addDirectionArrow, addElbowArrow, addSource, createDirectLabels, getXAxisTicks, customTemporalAxis } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.selectAll('#legend')
let pymChild = null;

let graphicData, size;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.margin[size];
	let chartWidth = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (config.aspectRatio[size][1] / config.aspectRatio[size][0]) * chartWidth

	// Get categories from the keys used in the stack generator
	// const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date');
	const categories = Object.keys(graphicData[0]).filter(d => !d.endsWith('_lowerCI') && !d.endsWith('_upperCI')).slice(1)

	const fulldataKeys = Object.keys(graphicData[0]).slice(1)

	// Define the x and y scales
	let xDataType;

	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	let x;
	if (xDataType == 'date') {
		x = d3.scaleTime()
			.domain(d3.extent(graphicData, (d) => d.date))
			.range([0, chartWidth]);
	} else if (config.xDomain == "auto") {
		x = d3.scaleLinear()
			.domain(d3.extent(graphicData, (d) => +d.date))
			.range([0, chartWidth]);
	} else {
		x = d3.scaleLinear()
			.domain(config.xDomain)
			.range([0, chartWidth]);
	}

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	if (config.yDomain == "auto") {
		y.domain(
			[d3.min(graphicData, (d) => Math.min(...fulldataKeys.map((c) => d[c]))),
			d3.max(graphicData, (d) => Math.max(...fulldataKeys.map((c) => d[c])))]
		)
	} else {
		y.domain(config.yDomain)
	}

	// Create an SVG element
	const svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// Add the x-axis
	let xAxisGenerator;

	if (config.labelSpans.enabled === true && xDataType=='date') {
		xAxisGenerator = customTemporalAxis(x)
			.tickSize(17).tickPadding(6)
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
		.call(xAxisGenerator); 

	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y).ticks(config.yAxisTicks[size]));

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
		);

	d3.selectAll('g.tick line')
		.each(function (e) {
			if (e == config.zeroLine) {
				d3.select(this).attr('class', 'zero-line');
			}
		})

	// create lines and areas for each category
	categories.forEach(function (category) {
		const lineGenerator = d3
			.line()
			.x((d) => x(d.date))
			.y((d) => y(d[category]))
			.defined(d => d[category] !== null) // Only plot lines where we have values
			.curve(d3[config.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
			.context(null);

		svg
			.append('path')
			.datum(graphicData)
			.attr('fill', 'none')
			.attr(
				'stroke',
				config.colourPalette[
				categories.indexOf(category) % config.colourPalette.length
				]
			)
			.attr('stroke-width', 3)
			.attr('d', lineGenerator)
			.style('stroke-linejoin', 'round')
			.style('stroke-linecap', 'round');

		const lastDatum = graphicData[graphicData.length - 1];

		const areaGenerator = d3.area()
			.x(d => x(d.date))
			.y0(d => y(d[`${category}_lowerCI`]))
			.y1(d => y(d[`${category}_upperCI`]))
			.defined(d => d[`${category}_lowerCI`] !== null && d[`${category}_upperCI`] !== null) // Only plot areas where we have values

		svg.append('path')
			.attr('class', 'shaded')
			.attr('d', areaGenerator(graphicData))
			.attr('fill', config.colourPalette[
				categories.indexOf(category) % config.colourPalette.length
			])
			.attr('opacity', 0.15)

		if (config.drawLegend || size === 'sm') {
			// Set up the legend
			let legenditem = d3
				.select('#legend')
				.selectAll('div.legend--item')
				.data(categories.map((c, i) => [c, config.colourPalette[i % config.colourPalette.length]]))
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

		}
	});

	if (!config.drawLegend && size !== 'sm') {
		const directLabels = config.directLabels || {};
		createDirectLabels({
			categories: categories,
			data: graphicData,
			svg: svg,
			xScale: x,
			yScale: y,
			margin: margin,
			chartHeight: height,
			config: config,
			options: {
				labelLocation: directLabels.labelLocation ?? 'lastPoint',
				minSpacing: directLabels.minSpacing ?? 0,
				minLabelOffset: directLabels.minLabelOffset ?? 5,
				labelGap: directLabels.gap ?? 10,
				labelGapWithLeaderLines: directLabels.gapWithLeaderLines ?? (directLabels.gap ?? 10),
				useLeaderLines: directLabels.useLeaderLines ?? true,
				leaderLineStyle: directLabels.leaderLineStyle ?? 'dashed',
				leaderLineColourMode: directLabels.leaderLineColourMode ?? 'series',
				leaderLineMonoColour: directLabels.leaderLineMonoColour ?? '#707070',
				leaderLineElbowOffset: directLabels.leaderLineElbowOffset ?? 10,
				leaderLineEndGap: directLabels.leaderLineEndGap ?? 2
			}
		});
	}

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
			ciSvg,//name of your svg, normally just SVG
			'left',//direction of arrow: left, right, up or down
			'start',//anchor end or start (end points the arrow towards your x value, start points away)
			60,//x value
			12,//y value
			config.legendEstimateText,//annotation text
			150,//wrap width
			'bottom'//Text vertical align: top, middle or bottom (default is middle)
		)

	}


	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 10 - margin.left,
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

// Load the data
d3.csv(config.graphicDataURL).then(data => {

	graphicData = data.map((d) => {
		if (d3.utcParse(config.dateFormat)(d.date) !== null) {
			return {
				date: d3.utcParse(config.dateFormat)(d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		} else {
			return {
				date: (+d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		}
	});

	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});
