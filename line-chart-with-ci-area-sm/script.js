import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addDirectionArrow, addElbowArrow, addSource, getXAxisTicks, calculateAutoBounds, customTemporalAxis, diamondShape } from "../lib/helpers.js";

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
			.range([height, 0]);

		// Calculate Y-axis bounds based on data and config
		const { minY, maxY } = calculateAutoBounds(graphicData, config);

		y.domain([minY, maxY]);


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
				.attr('opacity', 0.3)

			if (config.addEndMarkers) {
				// Add end marker for this category
				const lastDatum = [...data].reverse().find(d => d[category] != null && d[category] !== "");
				if (lastDatum) {
					const index = categories.indexOf(category);
					const shapeIndex = index % 6;
					const isFilled = shapeIndex < 3;
					const shapeType = shapeIndex % 3;
					const color = config.colourPalette[index % config.colourPalette.length];
					
					if (shapeType === 0) {
						// Circle
						svg.append('circle')
							.attr('cx', x(lastDatum.date))
							.attr('cy', y(lastDatum[category]))
							.attr('r', 3.5)
							.attr('class', 'line-end')
							.style('fill', isFilled ? color : 'white')
							.style('stroke', color);
					} else if (shapeType === 1) {
						// Square
						svg.append('rect')
							.attr('x', x(lastDatum.date) - 3.5)
							.attr('y', y(lastDatum[category]) - 3.5)
							.attr('width', 7)
							.attr('height', 7)
							.attr('class', 'line-end')
							.style('fill', isFilled ? color : 'white')
							.style('stroke', color);
					} else {
						// Diamond
						svg.append('g')
							.attr('transform', `translate(${x(lastDatum.date)}, ${y(lastDatum[category])})`)
							.attr('class', 'line-end')
							.append('path')
							.attr('d', diamondShape(6))
							.style('fill', isFilled ? color : 'white')
							.style('stroke', color);
					}
				}
			}

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

		if (config.labelSpans.enabled === true) {
			xAxisGenerator = customTemporalAxis(x)
				.tickSize(17)
				.tickPadding(6)
				.tickFormat(d3.timeFormat("%y"));
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
			categories.map((c, i) => [c, config.colourPalette[i % config.colourPalette.length], i])
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem.each(function(d, i) {
		const item = d3.select(this);
		const svg = item.append('svg')
			.attr('width', 14)
			.attr('height', 14)
			.attr('viewBox', '0 0 12 12')
			.attr('class', 'legend--icon')
			.style('overflow', 'visible');
		
		const shapeIndex = d[2] % 6;
		const color = d[1];
		const isFilled = shapeIndex < 3;
		
		// Determine shape type: 0,3=circle, 1,4=square, 2,5=diamond
		const shapeType = shapeIndex % 3;
		
		if (shapeType === 0) {
			// Circle
			svg.append('circle')
				.attr('cx', 6)
				.attr('cy', 6)
				.attr('r', 3.5)
				.style('fill', isFilled ? color : 'white')
				.style('stroke', color);
		} else if (shapeType === 1) {
			// Square
			svg.append('rect')
				.attr('x', 2.5)
				.attr('y', 2.5)
				.attr('width', 7)
				.attr('height', 7)
				.style('fill', isFilled ? color : 'white')
				.style('stroke', color);
		} else {
			// Diamond
			svg.append('g')
				.attr('transform', 'translate(6, 6)')
				.append('path')
				.attr('d', diamondShape(6))
				.style('fill', isFilled ? color : 'white')
				.style('stroke', color);
		}
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
			date: d3.utcParse(config.dateFormat)(d.date),
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