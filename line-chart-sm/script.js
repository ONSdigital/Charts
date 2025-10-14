import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, keys, counter;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	const aspectRatio = config.aspectRatio[size];
	const chartsPerRow = config.chartEvery[size];

	const reference = config.referenceCategory;

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date' && k !== reference);
	const categoriesToPlot = Object.keys(graphicData[0]).filter((k) => k !== 'date')

	//This template works differently from the other small multiple templates in that we plot all the data on every chart,
	//so we don't need to slice the data up - we use graphicData every time. 
	//This step shapes the input for the data join to be consistent with the other templates.
	const categoriesWithNullData = categories.map(d => [d, null])

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(categoriesWithNullData)
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, seriesName, data, chartIndex) {

		let chartPosition = chartIndex % chartsPerRow;

		// Set dimensions
		let margin = { ...config.margin[size] };

		let chartGap = config.optional?.chartGap || 10;

		let chart_width = calculateChartWidth({
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

		//height is set by the aspect ratio
		let height =
			aspectRatio[1] / aspectRatio[0] * chart_width;

		// Define the x and y scales

		let xDataType;

		if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
			xDataType = 'date';
		} else {
			xDataType = 'numeric';
		}

		// console.log(xDataType)

		let x;

		if (xDataType == 'date') {
			x = d3.scaleTime()
				.domain(d3.extent(graphicData, (d) => d.date))
				.range([0, chart_width]);
		} else {
			x = d3.scaleLinear()
				.domain(d3.extent(graphicData, (d) => +d.date))
				.range([0, chart_width]);
		}


		const y = d3
			.scaleLinear()
			.range([height, 0]);

		if (config.yDomain == "auto") {
			let minY = d3.min(graphicData, (d) => Math.min(...categoriesToPlot.map((c) => d[c])))
			let maxY = d3.max(graphicData, (d) => Math.max(...categoriesToPlot.map((c) => d[c])))
			y.domain([minY, maxY])
			// console.log(minY, maxY)
		} else {
			y.domain(config.yDomain)
		}

		// Create an SVG element
		const svg = addSvg({
			svgParent: graphic,
			chart_width: chart_width,
			height: height + margin.top + margin.bottom,
			margin: margin
		})



		// create lines and circles for each category
		categoriesToPlot.forEach(function (category) {
			const lineGenerator = d3
				.line()
				.x((d) => x(d.date))
				.y((d) => y(d.amt))
				.defined(d => d.amt !== null) // Only plot lines where we have values
				.curve(d3[config.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
				.context(null);

			var lines = {};
			for (var column in graphicData[0]) {
				if (column == 'date') continue;
				lines[column] = graphicData.map(function (d) {
					return {
						'date': d.date,
						'amt': d[column]
					};
				});
			}

			//This interpolates points when a cell contains no data (draws a line where there are no data points)

			if (config.interpolateGaps) {

				keys = Object.keys(lines)
				for (let i = 0; i < keys.length; i++) {
					lines[keys[i]].forEach(function (d, j) {
						if (d.amt != null) {
							counter = j;
						} else {
							d.date = lines[keys[i]][counter].date
							d.amt = lines[keys[i]][counter].amt
						}
					})
				}

			}

			svg
				.append('path')
				.datum(Object.entries(lines))
				.attr('fill', 'none')
				.attr(
					'stroke', () => (categoriesToPlot.indexOf(category) == chartIndex) ? config.colourPalette[0] :
						category == reference ? config.colourPalette[1] : config.colourPalette[2]
					// config.colourPalette[
					// categories.indexOf(category) % config.colourPalette.length
					// ]
				)
				.attr('stroke-width', 2)
				.attr('d', (d, i) => lineGenerator(d[categoriesToPlot.indexOf(category)][1]))
				.style('stroke-linejoin', 'round')
				.style('stroke-linecap', 'round')
				.attr('class', 'line' + categoriesToPlot.indexOf(category) + 
				((categoriesToPlot.indexOf(category) == chartIndex) ? " selected" :
				category == reference ? " reference" : " other"));

			svg.selectAll('.line' + chartIndex).attr('stroke-width', 2.5).raise()

			const lastDatum = graphicData[graphicData.length - 1];

			//Labelling the final data point on each chart if option selected in the config
			if (config.labelFinalPoint == true) {
				// Add text labels to the right of the circles
				if (categories.indexOf(category) == chartIndex) {
					svg
						.append('text')
						.attr('class', 'dataLabel')
						.attr(
							'transform',
							`translate(${x(lastDatum.date)}, ${y(lastDatum[category])})`
						)
						.attr('x', 5)
						.attr('y', 4)
						.attr('text-anchor', 'start')
						.attr(
							'fill', config.colourPalette[0]
							// config.colourPalette[
							// categories.indexOf(category) % config.colourPalette.length
							// ]
						)
						.text(d3.format(",.0f")(lastDatum[category]))
				}

				if (categories.indexOf(category) == chartIndex) {
					svg
						.append('circle')
						.attr('class', 'selected')
						.attr('cx', x(lastDatum.date))
						.attr('cy', y(lastDatum[category]))
						.attr('r', 3)
						.attr(
							'fill', config.colourPalette[0]
							// config.colourPalette[
							// categories.indexOf(category) % config.colourPalette.length
							// ]
						);

					d3.selectAll('circle').raise()
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
					.tickSize(-chart_width)
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
					.tickValues(graphicData
						.map((d) => xDataType == 'date' ?
							d.date.getTime() : d.date
						) //just get dates as seconds past unix epoch
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
					.tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.xAxisTickFormat[size])(d)
						: d3.format(config.xAxisNumberFormat)(d))
			).each(function(d){
				d3.select(this).selectAll('.tick text')
				.attr('text-anchor', function(e,j,arr){
					return j==0 ? 'start' : j==arr.length-1 ? 'end' : 'middle'
				})
			});


		//Only draw the y axis tick labels on the first chart in each row
		if (chartIndex % chartsPerRow === 0) {
			svg
				.append('g')
				.attr('class', 'y axis numeric')
				.call(d3.axisLeft(y).ticks(config.yAxisTicks[size]))
				.selectAll('.tick text')
				.call(wrap, margin.left - 10);
		} else {
			svg.append('g').attr('class', 'y axis numeric').call(d3.axisLeft(y).tickValues([]));
		}


		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			yPosition: -margin.top / 2,
			text: seriesName,
			wrapWidth: (chart_width + margin.right)
		})


		// This does the y-axis label
		if (chartIndex % chartsPerRow === 0) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: 5 - margin.left,
				yPosition: 0,
				text: config.yAxisLabel,
				textAnchor: "start",
				wrapWidth: chart_width
			});
		}

		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...chartContainers].length - 1) {
			addAxisLabel({
				svgContainer: svg,
				xPosition: chart_width,
				yPosition: height + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
	});


	// Set up the legend
	let legenditem = legend
		.selectAll('div.legend--item')
		.data([[config.legendLabel, config.colourPalette[0]], [reference, config.colourPalette[1]], [config.allLabel, config.colourPalette[2]]])
		.enter()
		.append('div')
		.attr('class','legend--item');

	legenditem
		.append('div')
		.attr('class', (d,i) =>  'legend--icon--refline legend--icon--refline' + i)
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
