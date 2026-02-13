import { initialise, addSvg, addSource, createDirectLabels, calculateAutoBounds } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let graphicData, size;

let pymChild = null;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);
	const aspectRatio = config.aspectRatio[size]

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.margin[size];
	if (size == "sm") {
		margin.left = 50
		margin.right = parseInt(graphic.style('width')) - 230;
	} else {
		let slopeMargin = parseInt(graphic.style('width')) / 2 - 90;

		margin.left = slopeMargin
		margin.right = slopeMargin
	}


	let chartWidth = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (aspectRatio[1] / aspectRatio[0]) * chartWidth;

	const columns = graphicData.columns.slice(1)

	let x = d3.scalePoint().domain(columns)
		.range([0, chartWidth])

	let xLabels = d3.scalePoint().domain(config.xAxisLabels)
		.range([0, chartWidth])

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	// Calculate Y-axis bounds based on data and config
	const { minY, maxY } = calculateAutoBounds(graphicData, config);

	if (config.showZeroAxis) {
		y.domain([d3.min([0,minY]), maxY]);
	} else {
		y.domain([minY, maxY]);
	}

	// Create an SVG element
	const svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	const categories = graphicData.map(d => d.name)

	const lineGenerator = d3
		.line()
		.x(d => x(d.x))
		.y(d => y(d.y))
		.defined(d => d.y !== null && !isNaN(d.y))
		.curve(d3[config.lineCurveType]);

	function direction(data) {
		if (+data[columns[0]] > +data[columns[columns.length - 1]]) {
			return 0
		} else if (+data[columns[columns.length - 1]] > +data[columns[0]]) {
			return 2
		} else if (+data[columns[0]] == +data[columns[columns.length - 1]]) {
			return 1
		}
	}

	// const colourDirectionScale = d3.scaleOrdinal().domain(["decreasing", "same", "increasing"]).range(config.colourPalette)

	// add grid lines to y axis
	if (config.showZeroAxis) {
		const zeroAxis = svg
			.append('g')
			.attr('transform', "translate(" + -20 + ",0)")
			.attr('class', 'y axis')
			.call(
				d3
					.axisLeft(y)
					.tickValues([0])
					.tickSize(-220)
				// .tickFormat('')
			)

		svg.append('g').attr('transform', "translate(" + (chartWidth + 20) + ",0)")
			.attr('class', 'y axis')
			.call(d3.axisRight(y).tickValues([0]).tickSize(0))


		zeroAxis.selectAll('g.tick line')
			.attr('class', 'zero-line')

	}


	// Add the x-axis
	const xAxis = svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisTop(xLabels)
				.tickSize(height)
		)

	xAxis.selectAll(".tick text")
		.attr('dy', "-0.5em")
		.style("font-weight", 700)
		.style("fill", ONScolours.grey100);

	xAxis.selectAll(".tick line")
		.style("stroke", ONScolours.grey40)

	const transposeData = columns.map(key => {
		const newObj = { date: key };

		graphicData.forEach(item => {
			newObj[item.name] = +item[key];
		});

		return newObj;
	})

	const colourMap = new Map();
	categories.forEach(category => {
		colourMap.set(category, config.colourScheme === "categories"
			? config.colourPalette[
			categories.indexOf(category) % config.colourPalette.length
			]
			: config.colourPalette[
			direction(graphicData.find(d => d.name === category))
			]
		);
	})

	createDirectLabels({
		categories: categories,
		data: transposeData,
		svg: svg,
		xScale: x,
		yScale: y,
		margin: margin,
		chartHeight: height,
		config: config,
		options: {
			labelStrategy: size == "sm" ? 'last' : 'firstLast',
			minSpacing: 12,
			useLeaderLines: true,
			leaderLineStyle: 'dashed',
			colourMap: colourMap,
			includeDataValue: true
		}
	});



	// create lines and circles for each category
	categories.forEach(function (category, index) {

		const itemData = columns.map(col => ({
			x: col,
			y: Number(graphicData.find(d => d.name === category)[col])
		}));

		svg
			.append('path')
			.datum(itemData)
			.attr('fill', 'none')
			.attr(
				'stroke', config.colourScheme == "categories"
				? config.colourPalette[categories.indexOf(category) % config.colourPalette.length]
				: config.colourPalette[direction(graphicData.find(d => d.name === category))]
			)
			.attr('stroke-width', 2.5)
			.attr('d', lineGenerator)
			.style('stroke-linejoin', 'round')
			.style('stroke-linecap', 'round');

		itemData.forEach(data => {
			svg.append('circle')
				.datum(data)
				.attr('cx', d => x(d.x))
				.attr('cy', d => y(d.y))
				.style('fill', config.colourScheme == "categories"
					? config.colourPalette[categories.indexOf(category) % config.colourPalette.length]
					: config.colourPalette[direction(graphicData.find(d => d.name === category))]
				)
				.attr('r', 6)
				.raise()
		})
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
	graphicData = rawData

	rawData.columns.slice(1).forEach(column=>
		graphicData.forEach(d=>d[column] = +d[column])
	)

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});
