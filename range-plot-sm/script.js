import { initialise, addSvg, wrap, addChartTitleLabel, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, groups, categories, xDomain, svg, charts;


function drawGraphic() {

	size = initialise(size);

	function calculateChartWidth(size) {
		const chartEvery = config.chartEvery[size];
		const chartMargin = config.margin[size];

		if (config.dropYAxis) {
			// Chart width calculation allowing for 30px left margin between the charts
			const chartWidth = ((parseInt(graphic.style('width')) - chartMargin.left - ((chartEvery - 1) * 30)) / chartEvery) - chartMargin.right;
			return chartWidth;
		} else {
			const chartWidth = ((parseInt(graphic.style('width')) / chartEvery) - chartMargin.left - chartMargin.right);
			return chartWidth;
		}
	}

	groups = d3.groups(graphic_data, (d) => d.group);
	categories = d3.groups(graphic_data, (d) => d.category);

	if (config.xDomain == 'auto') {
		let min = 1000000;
		let max = 0;
		for (i = 2; i < graphic_data.columns.length; i++) {
			min = d3.min([
				min,
				d3.min(graphic_data, (d) => +d[graphic_data.columns[i]])
			]);
			max = d3.max([
				max,
				d3.max(graphic_data, (d) => +d[graphic_data.columns[i]])
			]);
		}
		xDomain = [min, max];
	} else {
		xDomain = config.xDomain;
	}

	const colour = d3
		.scaleOrdinal()
		.range(config.colourPalette)
		.domain(Object.keys(config.legendLabels));

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.seriesHeight[size] * d[1].length / categories.length;

		// y scale
		d[3] = d3
			.scalePoint()
			.padding(0.5)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
	});

	let chartContainers = graphic.selectAll('div.categoryLabels').data(groups).join('div').attr('class', 'chart-container');
	// divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	chartContainers
		.append('p')
		.attr('class', 'groupLabels')
		.html((d) => d[0]);

	function drawChart(container, seriesName, data, chartIndex) {
		for (let i = 0; i < categories.length; i++) {
			let chartPosition = i % config.chartEvery[size]

			let margin = { ...config.margin[size] };

			// If the chart is not in the first position in the row, reduce the left margin
			if (config.dropYAxis) {
				if (chartPosition !== 0) {
					margin.left = 30;
				}
			}

			let chart_width = calculateChartWidth(size)

			//set up scales
			let x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);


			//set up xAxis generator
			let xAxis = d3.axisBottom(x)
				.ticks(config.xAxisTicks[size])
				.tickFormat(d => d3.format(config.xAxisTickFormat)(d));

			svg = addSvg({
				svgParent: container,
				chart_width: chart_width,
				height: (d) => d[2] + margin.top + margin.bottom,
				margin: margin
			})

			svg.each(function (d) {
				if (chartPosition == 0 || !config.dropYAxis) {
					d3.select(this)
						.append('g')
						.attr('class', 'y axis')
						.call(d[4])
						.selectAll('text')
						.call(wrap, margin.left - 15);
				}

				d3.select(this)
					.append('g')
					.attr('transform', (d) => 'translate(0,' + d[2] + ')')
					.attr('class', 'x axis')
					.each(function () {
						d3.select(this)
							.call(xAxis.tickSize(-d[2]))
							.selectAll('line')
							.each(function (e) {
								if (e == 0) {
									d3.select(this).attr('class', 'zero-line');
								}
							});
					});

				addChartTitleLabel({
					svgContainer: d3.select(this),
					yPosition: -5,
					text: chartPosition == 0 ? "Graduates" : "L3 to L5 non-graduates",
					wrapWidth: chart_width
				})
			})

			svg
				.selectAll('line.between')
				.data((d) => d[1].filter(e => e.category == categories[i][0]))
				.join('line')
				.attr('class', 'between')
				.attr('x1', (d) => x(d.min))
				.attr('x2', (d) => x(d.max))
				.attr('y1', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
				.attr('y2', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
				.attr('stroke', '#c6c6c6')
				.attr('stroke-width', '3px');

			svg
				.selectAll('rect.min1')
				.data((d) => d[1].filter(e => e.category == categories[i][0]))
				.join('rect')
				.attr('class', 'min1')
				.attr('x', (d) => x(d.min) - 5)
				.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) - 5)
				.attr('width', 10)
				.attr('height', 10)
				.attr('transform', (d) => `rotate(45 ${x(d.min) + 0} ${groups.filter((f) => f[0] == d.group)[0][3](d.name) - 0})`)
				.attr('fill', colour('min'));

			svg
				.selectAll('circle.max')
				.data((d) => d[1].filter(e => e.category == categories[i][0]))
				.join('circle')
				.attr('class', 'max')
				.attr('cx', (d) => x(d.max))
				.attr('cy', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
				.attr('r', 6)
				.attr('fill', colour('max'));

			if (config.showDataLabels) {
				svg
					.selectAll('text.min')
					.data((d) => d[1].filter(e => e.category == categories[i][0]))
					.join('text')
					.attr('class', 'dataLabels')
					.attr('x', (d) => x(d.min))
					.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
					.text((d) => d3.format(config.numberFormat)(d.min))
					.attr('fill', colour('min'))
					.attr('dy', 6)
					.attr('dx', (d) => (+d.min < +d.max ? -8 : 8))
					.attr('text-anchor', (d) => (+d.min < +d.max ? 'end' : 'start'));

				svg
					.selectAll('text.max')
					.data((d) => d[1].filter(e => e.category == categories[i][0]))
					.join('text')
					.attr('class', 'dataLabels')
					.attr('x', (d) => x(d.max))
					.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
					.text((d) => d3.format(config.numberFormat)(d.max))
					.attr('fill', colour('max'))
					.attr('dy', 6)
					.attr('dx', (d) => (+d.min > +d.max ? -8 : 8))
					.attr('text-anchor', (d) => (+d.min > +d.max ? 'end' : 'start'));
			}

			// This does the x-axis label
			svg.each(function (d, i) {
				if (chartIndex == groups.length - 1) {
					addAxisLabel({
						svgContainer: d3.select(this),
						xPosition: chart_width,
						yPosition: (d) => d[2] + 35,
						text: chartPosition === categories.length - 1 ?
							config.xAxisLabel : "",
						textAnchor: "end",
						wrapWidth: chart_width
					});
				}
			});


		}
	}

	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), key, value, i);
	});



	// let svgs = [];

	// for (let i = 0; i < categories.length; i++) {

	// 	let chartsPerRow = config.chartEvery[size];
	// 	let chartPosition = i % chartsPerRow;


	// 	let margin = { ...config.margin[size] };

	// 	// If the chart is not in the first position in the row, reduce the left margin
	// 	if (config.dropYAxis) {
	// 		if (chartPosition !== 0) {
	// 			margin.left = 30;
	// 		}
	// 	}

	// 	let chart_width = calculateChartWidth(size)

	// 	//set up scales
	// 	let x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);


	// 	//set up xAxis generator
	// 	let xAxis = d3.axisBottom(x)
	// 		.ticks(config.xAxisTicks[size])
	// 		.tickFormat(d => d3.format(config.xAxisTickFormat)(d));

	// 	svgs[i] = chartContainers
	// 		.append('svg')
	// 		.attr('class', 'chart')
	// 		.attr('height', (d) => d[2] + margin.top + margin.bottom)
	// 		.attr('width', chart_width + margin.left + margin.right);

	// 	charts = svgs[i]
	// 		.append('g')
	// 		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// 	charts.each(function (d) {
	// 		if (chartPosition == 0 || !config.dropYAxis) {
	// 			d3.select(this)
	// 				.append('g')
	// 				.attr('class', 'y axis')
	// 				.call(d[4])
	// 				.selectAll('text')
	// 				.call(wrap, margin.left - 15);
	// 		}


	// 		d3.select(this)
	// 			.append('g')
	// 			.attr('transform', (d) => 'translate(0,' + d[2] + ')')
	// 			.attr('class', 'x axis')
	// 			.each(function () {
	// 				d3.select(this)
	// 					.call(xAxis.tickSize(-d[2]))
	// 					.selectAll('line')
	// 					.each(function (e) {
	// 						if (e == 0) {
	// 							d3.select(this).attr('class', 'zero-line');
	// 						}
	// 					});
	// 			});

	// 		//Add graduate/non label to each chart
	// 		d3.select(this)
	// 			.append('text')
	// 			.attr('x', 0)
	// 			.attr('y', -5)
	// 			// .attr('class', 'axis--label')
	// 			.text(i == 0 ? "Graduates" : "L3 to L5 non-graduates")
	// 			.attr('text-anchor', 'start')
	// 			.attr('class', 'title');
	// 	});

	// 	charts
	// 		.selectAll('rect.min1')
	// 		.data((d) => d[1].filter(e => e.category == categories[i][0]))
	// 		.join('rect')
	// 		.attr('class', 'min1')
	// 		.attr('x', (d) => x(d.min) - 5)
	// 		.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) - 5)
	// 		.attr('width', 10)
	// 		.attr('height', 10)
	// 		.attr('transform', (d) => `rotate(45 ${x(d.min) + 0} ${groups.filter((f) => f[0] == d.group)[0][3](d.name) - 0})`)
	// 		.attr('fill', colour('min'));

	// 	charts
	// 		.selectAll('circle.max')
	// 		.data((d) => d[1].filter(e => e.category == categories[i][0]))
	// 		.join('circle')
	// 		.attr('class', 'max')
	// 		.attr('cx', (d) => x(d.max))
	// 		.attr('cy', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
	// 		.attr('r', 6)
	// 		.attr('fill', colour('max'));

	// 	if (config.showDataLabels) {
	// 		charts
	// 			.selectAll('text.min')
	// 			.data((d) => d[1].filter(e => e.category == categories[i][0]))
	// 			.join('text')
	// 			.attr('class', 'dataLabels')
	// 			.attr('x', (d) => x(d.min))
	// 			.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
	// 			.text((d) => d3.format(config.numberFormat)(d.min))
	// 			.attr('fill', colour('min'))
	// 			.attr('dy', 6)
	// 			.attr('dx', (d) => (+d.min < +d.max ? -8 : 8))
	// 			.attr('text-anchor', (d) => (+d.min < +d.max ? 'end' : 'start'));

	// 		charts
	// 			.selectAll('text.max')
	// 			.data((d) => d[1].filter(e => e.category == categories[i][0]))
	// 			.join('text')
	// 			.attr('class', 'dataLabels')
	// 			.attr('x', (d) => x(d.max))
	// 			.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name))
	// 			.text((d) => d3.format(config.numberFormat)(d.max))
	// 			.attr('fill', colour('max'))
	// 			.attr('dy', 6)
	// 			.attr('dx', (d) => (+d.min > +d.max ? -8 : 8))
	// 			.attr('text-anchor', (d) => (+d.min > +d.max ? 'end' : 'start'));
	// 	}



	// 	// This does the x-axis label
	// 	charts.each(function (d, i) {
	// 		if (i == groups.length - 1) {
	// 			d3.select(this)
	// 				.append('text')
	// 				.attr('x', chart_width)
	// 				.attr('y', (d) => d[2] + 35)
	// 				.attr('class', 'axis--label')
	// 				.text(config.xAxisLabel)
	// 				.attr('text-anchor', 'end');
	// 		}
	// 	});
	// }//End for



	// // Set up the legend
	let legenditem = legend
		.selectAll('div.legend--item')
		.data(
			d3.zip(
				Object.values(config.legendLabels),
				config.colourPalette
			)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', (d, i) => i == 1 ? 'legend--icon--circle' : 'legend--icon--diamond')
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
}

d3.csv(config.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
