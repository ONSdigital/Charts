import { initialise, wrap, addSvg, addAxisLabel, addSource, createDirectLabels, getXAxisTicks } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let graphicData, size;

let pymChild = null;

function getXAxisTickFormat({ xDataType, size, config }) {
	if (xDataType == 'date') {
		if (config.labelTicksOrSpans == 'spans') {
			return (d) => "";
		} else {
			return (d) => d3.timeFormat(config.xAxisTickFormat[size])(d);
		}
	} else {
		return (d) => d3.format(config.xAxisNumberFormat)(d);
	}
}

function placeTimespanLabels({
	svg,
	x,
	ticks,
	height,
	size,
	config
}) {
	// Calculate the domain span in milliseconds
	const [domainStart, domainEnd] = x.domain();
	const domainSpanMs = domainEnd - domainStart;

	// Convert milliseconds to months for easier comparison
	const domainSpanMonths = domainSpanMs / (1000 * 60 * 60 * 24 * 30.44); // average month length


	// Determine the appropriate tick and format functions
	let tickFunction, formatFunction, timePeriodMs;

	if (domainSpanMonths <= 12) {
		// For up to 1 years, use months
		tickFunction = d3.timeMonth;
		formatFunction = d3.utcFormat("%b %Y");
		timePeriodMs = 1000 * 60 * 60 * 24 * 30.44; // approximate month in ms
	} else {
		// For more than 1 years, use years
		tickFunction = d3.timeYear;
		formatFunction = d3.utcFormat("%Y");
		timePeriodMs = 1000 * 60 * 60 * 24 * 365.25; // approximate year in ms
	}

	// Prepare label values
	let xLabelValues = [];

	// Before first tick midpoint
	if (ticks.length > 0 &&
		(ticks[0].getTime() - domainStart.getTime()) > timePeriodMs / 2) {
		xLabelValues.push(new Date(ticks[0].getTime() - timePeriodMs / 2));
	}

	// Midpoints between ticks
	xLabelValues.push(...ticks
		.slice(0, -1)
		.map(
			(d, i) => new Date((d.getTime() + ticks[i + 1].getTime()) / 2)
		));

	// After last tick midpoint
	if (ticks.length > 0 &&
		(domainEnd.getTime() - ticks[ticks.length - 1].getTime()) > timePeriodMs / 2) {
		xLabelValues.push(new Date(ticks[ticks.length - 1].getTime() + timePeriodMs / 2));
	}

	// ----- Render text-only axis at midpoints -----
	svg.append("g")
		.attr('class', "x axis label")
		.attr("transform", `translate(0, ${height+4})`)
		.call(
			d3.axisBottom(x)
				.tickValues(xLabelValues)
				.tickSize(0)
				.tickFormat((d) => d3.timeFormat(config.xAxisTickFormat[size])(d))
		)
		.selectAll("line,path")
		.style("display", "none"); // hide axis lines
}

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);
	const aspectRatio = config.aspectRatio[size]

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.margin[size];
	let chartWidth = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (aspectRatio[1] / aspectRatio[0]) * chartWidth;

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date');

	let xDataType;

	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

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

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	let maxY, minY;

	if (config.yDomainMax === "auto") {
		maxY = d3.max(graphicData, d => d3.max(categories, c => d[c]));
	} else {
		maxY = config.yDomainMax;
	}

	if (config.yDomainMin === "auto") {
		minY = d3.min(graphicData, d => d3.min(categories, c => d[c]));
	} else {
		minY = config.yDomainMin;
	}

	// Ensure maxY is not less than minY
	if (maxY < minY) {
		const temp = maxY;
		maxY = minY;
		minY = temp;
	}

	y.domain([minY, maxY]);

	// Create an SVG element
	const svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	let labelData = [];

	// create lines and circles for each category
	categories.forEach(function (category, index) {
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
		if (lastDatum[category] === null || (config.drawLegend || size === 'sm')) return;
		const label = svg.append('text')
			.attr('class', 'directLineLabel')
			.attr('x', x(lastDatum.date) + 10)
			.attr('y', y(lastDatum[category]))
			.attr('dy', '.35em')
			.attr('text-anchor', 'start')
			.attr('fill', config.textColourPalette[index % config.textColourPalette.length])
			.text(category)
			.call(wrap, margin.right - 10);
		const bbox = label.node().getBBox();
		labelData.push({
			node: label,
			x: x(lastDatum.date) + 10,
			y: y(lastDatum[category]),
			originalY: y(lastDatum[category]),
			height: bbox.height,
			category: category
		});
	});

	if (config.addEndMarkers) {
		const circleData = categories.map((category, index) => {
			// Find last valid datum for this category
			const lastDatum = [...graphicData].reverse().find(d => d[category] != null && d[category] !== "");
			return lastDatum ? {
				category: category,
				index: index,
				x: x(lastDatum.date),
				y: y(lastDatum[category]),
				color: config.colourPalette[index % config.colourPalette.length]
			} : null;
		}).filter(d => d); // Remove null entries

		const circles = svg.selectAll('circle.line-end')
			.data(circleData, d => d.category)
			.enter()
			.append('circle')
			.attr('cx', d => d.x)
			.attr('cy', d => d.y)
			.style('fill', d => d.color)
			.attr('r', 4)
			.attr('class', 'line-end');
	}


	// size === 'sm'
	if (config.drawLegend || size === 'sm') {
		legend.selectAll("*").remove()

		// Set up the legend
		let legenditem = legend
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
	} else {
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
				labelStrategy: 'lastValid',
				minSpacing: 12,
				useLeaderLines: true,
				leaderLineStyle: 'dashed'
			}
		});
	}


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

	const ticks = getXAxisTicks({
		data: graphicData,
		xDataType,
		size,
		config
	})

	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(x)
				.tickValues(ticks)
				.tickFormat(getXAxisTickFormat({ xDataType, size, config }))
		);

	if (config.labelTicksOrSpans === "spans") {
		placeTimespanLabels({ svg, x, ticks, height, size, config })
	}

	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y).ticks(config.yAxisTicks[size])
			.tickFormat(d3.format(config.yAxisNumberFormat))
			.tickSize(0));



	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -15,
		text: config.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chartWidth
	});

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chartWidth,
		yPosition: height + margin.bottom - 25,
		text: config.xAxisLabel,
		textAnchor: "end",
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
d3.csv(config.graphicDataURL).then((rawData) => {
	graphicData = rawData.map((d) => {
		if (d3.timeParse(config.dateFormat)(d.date) !== null) {
			return {
				date: d3.timeParse(config.dateFormat)(d.date),
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

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});
