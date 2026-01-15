import { initialise, wrap, addSvg, addAxisLabel, addSource, createDirectLabels, getXAxisTicks } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let graphicData, size;

let pymChild = null;

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

	// Calculate data min/max across all categories
	const dataYMin = d3.min(graphicData, d => d3.min(categories, c => d[c]));
	const dataYMax = d3.max(graphicData, d => d3.max(categories, c => d[c]));
	const dataRange = dataYMax - dataYMin;

	// Helper function to calculate auto axis bounds with smart trimming
	const calculateAutoBound = (dataValue, oppositeBound, isMin) => {
		// Start at zero, or use data value with 10% of data range as padding if beyond zero
		const padding = dataRange * 0.15;
		let base = isMin 
			? (dataValue < 0 ? dataValue - padding : 0)
			: (dataValue > 0 ? dataValue + padding : 0);
		
		// Check if there's excessive unused space (gap > 50% of range)
		const needsTrimming = isMin ? (dataValue > base) : (dataValue < base);
		
		if (needsTrimming) {
			const range = isMin ? (oppositeBound - base) : (base - oppositeBound);
			const gap = isMin ? (dataValue - base) : (base - dataValue);
			
			// If gap > 50% of range, cut the axis but keep 30% of final axis range as cushion
			if (range > 0 && gap / range > 0.5) {
				const cushion = 0.3;
				const newBound = (dataValue - cushion * oppositeBound) / (1 - cushion);
				const isValid = isMin ? (newBound < dataValue) : (newBound > dataValue);
				
				if (isValid) {
					base = newBound;
				}
			}
		}
		
		return base;
	};

	// Handle max Y domain
	if (config.yDomainMax === "auto") {
		maxY = calculateAutoBound(dataYMax, dataYMin, false);
	} else {
		maxY = config.yDomainMax;
	}

	// Handle min Y domain
	if (config.yDomainMin === "auto") {
		minY = calculateAutoBound(dataYMin, maxY, true);
	} else if (config.yDomainMin === "data") {
		// Data mode: use actual data minimum
		minY = dataYMin;
	} else {
		// Numeric value provided (e.g., 0 to force zero baseline)
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

	d3.selectAll('g.tick line')
		.each(function (e) {
			if (e == config.zeroLine) {
				d3.select(this).attr('class', 'zero-line');
			}
		})

	// Add the x-axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(x)
				.tickValues(getXAxisTicks({
					data: graphicData,
					xDataType,
					size,
					config
				}))
				.tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.xAxisTickFormat[size])(d)
					: d3.format(config.xAxisNumberFormat)(d))
		);

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
