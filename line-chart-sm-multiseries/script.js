import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource, getXAxisTicks, customTemporalAxis, calculateAutoBounds, drawIndexedLegendShape, drawIndexedLineEndMarker } from "../lib/helpers.js";


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

		const {minY,maxY} = calculateAutoBounds(config.freeYAxisScales ? data : graphicData, config)

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

		// Add end markers
		if (config.addEndMarkers) {
			const markerData = categories.map((category, index) => {
				// Find last valid datum for this category
				const lastDatum = [...data].reverse().find(d => d[category] != null && d[category] !== "");
				return lastDatum ? {
					category: category,
					index: index,
					x: x(lastDatum.date),
					y: y(lastDatum[category]),
					color: config.colourPalette[index % config.colourPalette.length]
				} : null;
			}).filter(d => d); // Remove null entries

			markerData.forEach(d => {
				drawIndexedLineEndMarker({
					svg,
					index: d.index,
					color: d.color,
					x: d.x,
					y: d.y,
					size: 3.5,
					diamondSize: 6,
				});
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

			drawIndexedLegendShape({
				svg,
				index: d[2],
				color: d[1],
				size: 3.5,
				diamondSize: 6,
			});
	});

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
