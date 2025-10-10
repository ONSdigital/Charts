import { initialise, calculateChartWidth, addDataLabels, addChartTitleLabel, addAxisLabel, wrap, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg, divs, svgs, charts; //need to set the values to work with the helpers module

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	//set margin

	let margin = config.margin[size];

	//chart width calculated - allows small multiple chart widths to be calculated for the 'bar' chart type but defaults to 1 for the rest
	let chart_width = calculateChartWidth({
		screenWidth: parseInt(graphic.style('width')),
		chartEvery: (config.chartType === "bar"? config.chartEvery[size] : 1),
		chartMargin: config.margin[size]
	})
				
	//set up linear x scales for all chart types
	const x = d3.scaleLinear().range([0, chart_width]);

	//if the config is set to auto, it will take the min and max values from the ref and value columns
	if (config.xDomain == 'auto') {
				x.domain([
					Math.min(0, d3.min(graphic_data.map(({ value }) => Number(value))),
						d3.min(graphic_data.map(({ ref }) => Number(ref)))),
					//x domain is the maximum out of the value and the reference value
					Math.max(d3.max(graphic_data.map(({ value }) => Number(value))),
						d3.max(graphic_data.map(({ ref }) => Number(ref))))
				])
			} else {
				x.domain(config.xDomain);
			}

	//create the data groups for comet and range charts

	let groups = d3.groups(graphic_data, (d) => d.series);

	//functions to draw the charts according to chart type (bar, comet, dot or range)

	function drawBars() {

	//Set up the legend
	legend
		.append('div')
		.attr('class', 'legend--item--here')
		.append('div').attr('class', 'legend--icon--circle')
		.style('background-color', config.colourPalette[0])

	d3.select(".legend--item--here")
		.append('div')
		.append('p').attr('class', 'legend--text')
		.html(config.legendLabels[0])

	legend
		.append('div')
		.attr("class", "legend--item--here refline")
		.append('div')
		.attr('class', 'legend--icon--refline')
		.style('background-color', '#222')
		.style('border-radius', '5px');

	d3.select(".legend--item--here.refline")
		.append('div')
		.append('p').attr('class', 'legend--text')
		.html(config.legendLabels[1])

	// Nest the graphic_data by the 'series' column
	let nested_data = d3.group(graphic_data, (d) => d.series);

	//Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
	let namesArray = [...nested_data][0][1].map(d => d.name);

	// Create a container div for each small multiple
	let chartContainers = graphic
		.selectAll('.chart-container')
		.data(Array.from(nested_data))
		.join('div')
		.attr('class', 'chart-container');

	function drawChart(container, data, chartIndex) {
		// Log the data being used for each small multiple
		// console.log('Data for this small multiple:', data);
		// console.log(chartIndex);

		//Sort the data so that the bars in each chart are in the same order
		data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

	
		// Calculate the height based on the data
		let height = config.seriesHeight[size] * data.length +
			10 * (data.length - 1) +
			12;


		let chartsPerRow = config.chartEvery[size];
		let chartPosition = chartIndex % chartsPerRow;

		let margin = { ...config.margin[size] };

		// If the chart is not in the first position in the row, reduce the left margin
		if (config.dropYAxis) {
			if (chartPosition !== 0) {
				margin.left = 10;
			}
		}

	

		const y = d3
			.scaleBand()
			.paddingOuter(0.2)
			.paddingInner(((data.length - 1) * 10) / (data.length * 30))
			.range([0, height])
			.round(true);

		//use the data to find unique entries in the name column
		y.domain([...new Set(data.map((d) => d.name))]);

		//set up yAxis generator

		let yAxis = d3.axisLeft(y)
			.tickSize(0)
			.tickPadding(10)
			.tickFormat((d) => config.dropYAxis !== true ? (d) :
				chartPosition == 0 ? (d) : "");

		//set up xAxis generator
		let xAxis = d3
			.axisBottom(x)
			.tickSize(-height)
			.tickFormat(d3.format(config.dataLabels.numberFormat))
			.ticks(config.xAxisTicks[size]);

		//create svg for chart
		svg = container
			.append('svg')
			.attr('width', chart_width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('class', 'chart')
			.style('background-color', '#fff')
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


		svg
			.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'x axis')
			.call(xAxis)
			.selectAll('line')
			.each(function (d) {
				if (d == 0) {
					d3.select(this).attr('class', 'zero-line');
				}
			});

		// if (chartPosition == 0) {
		svg
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.selectAll('text')
			.call(wrap, margin.left - 10);
		// }


		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => y(d.name))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', y.bandwidth())
			.attr('fill', config.colourPalette[0]);


		svg
			.selectAll('line.refline')
			.data(data)
			.join('line')
			.attr('class', 'refline')
			.attr('x1', (d) => x(d.ref))
			.attr('x2', (d) => x(d.ref))
			.attr('y1', (d) => y(d.name))
			.attr('y2', (d) => y(d.name) + y.bandwidth())


		if (config.dataLabels.show == true) {
			addDataLabels({
				svgContainer: svg,
				data: data,
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: y
			})
		} //end if for datalabels


		// This does the chart title label
		addChartTitleLabel({
			svgContainer: svg,
			text: d => d[0],
			wrapWidth: chart_width
		});

		
		// This does the x-axis label
		if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nested_data].length - 1) {
			//This does the x-axis label
			addAxisLabel({
				svgContainer: svg,
				xPosition: chart_width,
				yPosition: height + 35,
				text: config.xAxisLabel,
				wrapWidth: chart_width
			});
			
		}
	}

	// Draw the charts for each small multiple
	chartContainers.each(function ([key, value], i) {
		drawChart(d3.select(this), value, i);
	});

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}

	}//end drawBars

	function drawComet() {

		
	
		let chart_width =
			parseInt(graphic.style('width')) - margin.left - margin.right;

	
		let cometLegendLabels = { "min": config.legendLabels[0], "max": config.legendLabels[1] }

		const colour = d3
			.scaleOrdinal()
			.range(config.colourPalette)
			.domain(Object.keys(cometLegendLabels));
	
		// create the y scale in groups
		groups.map(function (d) {
			//height
			d[2] = config.seriesHeight[size] * d[1].length;
	
			// y scale
			d[3] = d3
				.scalePoint()
				.padding(0.5)
				.range([0, d[2]])
				.domain(d[1].map((d) => d.name));
			//y axis generator
			d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
		});
	
		//set up xAxis generator
		let xAxis = d3.axisBottom(x).ticks(config.xAxisTicks[size]).tickFormat(d => d3.format(config.dataLabels.numberFormat)(d));
	
		divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');
	
		divs
			.append('p')
			.attr('class', 'groupLabels')
			.html((d) => d[0]);
	
		svgs = divs
			.append('svg')
			.attr('class', 'chart')
			.attr('height', (d) => d[2] + margin.top + margin.bottom)
			.attr('width', chart_width + margin.left + margin.right);
	
		charts = svgs
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	
		charts.each(function (d) {
			d3.select(this)
				.append('g')
				.attr('class', 'y axis')
				.call(d[4])
				.selectAll('text')
				.call(wrap, margin.left - 10);
	
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
		});
	
		charts
			.selectAll('line.between')
			.data((d) => d[1])
			.join('line')
			.attr('class', 'between')
			.attr('x1', (d) => x(d.value))
			.attr('x2', (d) => x(d.ref))
			.attr('y1', (d, i) => groups.filter((e) => e[0] == d.series)[0][3](d.name))
			.attr('y2', (d, i) => groups.filter((e) => e[0] == d.series)[0][3](d.name))
			.attr('stroke', (d) =>
				+d.value > +d.ref
					? config.colourPalette[1]//increase
					: +d.value < +d.ref
					? config.colourPalette[0]//decrease
					: config.colourPalette[2]//same
			)
			.attr('stroke-width', '3px');
	
	
		charts
			.selectAll('circle.max')
			.data((d) => d[1])
			.join('circle')
			.attr('class', 'max')
			.attr('cx', (d) => x(d.ref))
			.attr('cy', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
			.attr('r', config.dotsize)
			.attr('fill', (d) =>
				+d.value > +d.ref
					? config.colourPalette[1]//increase
					: +d.value < +d.ref
					? config.colourPalette[0]//decrease
					: config.colourPalette[2]//same
			);

	
		if (config.dataLabels.show == true) {
			charts
				.selectAll('text.min')
				.data((d) => d[1])
				.join('text')
				.attr('class', 'dataLabels')
				.attr('x', (d) => x(d.value))
				.attr('y', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
				.text((d) => d3.format(config.dataLabels.numberFormat)(d.value))
				.attr('fill', (d) =>
					+d.value > +d.ref
						? config.colourPalette[1]//increase
						: +d.value < +d.ref
						? config.colourPalette[0]//decrease
						: 'none'
				)
				.attr('dy', 6)
				.attr('dx', (d) => (+d.value < +d.ref ? -5 : 5))
				.attr('text-anchor', (d) => (+d.value < +d.ref ? 'end' : 'start'));
	
			charts
				.selectAll('text.max')
				.data((d) => d[1])
				.join('text')
				.attr('class', 'dataLabels')
				.attr('x', (d) => x(d.ref))
				.attr('y', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
				.text((d) => d3.format(config.dataLabels.numberFormat)(d.ref))
				.attr('fill', (d) =>
					+d.value > +d.ref
						? config.colourPalette[1]//increase
						: +d.value < +d.ref
						? config.colourPalette[0]//decrease
						: config.colourPalette[2]//same
				)
				.attr('dy', 6)
				.attr('dx', (d) =>
					+d.value > +d.ref
						? -(config.dotsize + 5)
						: config.dotsize + 5
				)
				.attr('text-anchor', (d) => (+d.value > +d.ref ? 'end' : 'start'));
		}//ends function to draw datalabels
	
		// This does the x-axis label
		charts.each(function (d, i) {
			if (i == groups.length - 1) {
				d3.select(this)
					.append('text')
					.attr('x', chart_width)
					.attr('y', (d) => d[2] + 35)
					.attr('class', 'axis--label')
					.text(config.xAxisLabel)
					.attr('text-anchor', 'end');
			}
		});
	

		// // Set up the legend
		let legenditem = d3
			.select('#legend')
			.selectAll('div.legend--item')
			.data(["Inc","Dec","No"])
			.enter()
			.append('div')
			.attr('class', (d) => 'legend--item ' + [d]);
	
		drawLegend();
	
		function drawLegend() {
			let var_group = d3
				.select('#legend')
				.selectAll('div.legend--item.Inc')
				.append('svg')
				.attr('height', config.legendHeight[size])
				.attr('width', config.legendItemWidth);
			let var_group2 = d3
				.select('#legend')
				.selectAll('div.legend--item.Dec')
				.append('svg')
				.attr('height', config.legendHeight[size])
				.attr('width', config.legendItemWidth);
			let var_group3 = d3
				.select('#legend')
				.selectAll('div.legend--item.No')
				.append('svg')
				.attr('height', config.legendHeight[size])
				.attr('width', config.legendItemWidth);
	
			//Increase legend item
			var_group
				.append('text')
				.attr('y', 30)
				.attr('x', 0)
				.attr('text-anchor', 'start')
				.attr('class', 'mintext legendLabel')
				.attr('fill', config.colourPalette[0])
				.text(config.legendLabels[0]);
	
			//this measures how wide the "min" value is so that we can place the legend items responsively
			let minTextWidth = d3.select('text.mintext').node().getBBox().width + 5;
	
			var_group
				.append('line')
				.attr('stroke', config.colourPalette[0])
				.attr('stroke-width', '3px')
				.attr('y1', 26)
				.attr('y2', 26)
				.attr('x1', minTextWidth)
				.attr('x2', minTextWidth + config.legendLineLength);
	
			var_group
				.append('circle')
				.attr('r', config.dotsize)
				.attr('fill', config.colourPalette[0])
				.attr('cx', minTextWidth + config.legendLineLength)
				.attr('cy', 26);
	
			var_group
				.append('text')
				.attr('y', 30)
				.attr(
					'x',
					minTextWidth +
						config.legendLineLength +
						config.dotsize +
						5
				)
				.attr('text-anchor', 'start')
				.attr('class', 'maxtext legendLabel')
				.attr('fill', config.colourPalette[0])
				.text(cometLegendLabels.max);
	
			//this measures how wide the "max" value is so that we can place the legend items responsively
			let maxTextWidth = d3.select('text.maxtext').node().getBBox().width + 5;
	
			//increase legend item text
			var_group
				.append('text')
				.attr('y', 15)
				.attr(
					'x',
					(minTextWidth +
						config.legendLineLength +
						config.dotsize +
						maxTextWidth) /
						2
				)
				.attr('text-anchor', 'middle')
				.attr('class', 'legendLabel')
				.attr('fill', config.colourPalette[0])
				.text('Increase');
	
			//Decrease legend item
			var_group2
				.append('line')
				.attr('stroke', config.colourPalette[1])
				.attr('stroke-width', '3px')
				.attr('y1', 26)
				.attr('y2', 26)
				.attr('x1', maxTextWidth + config.dotsize)
				.attr(
					'x2',
					maxTextWidth +
						config.dotsize +
						config.legendLineLength
				);
	
			var_group2
				.append('circle')
				.attr('r', config.dotsize)
				.attr('fill', config.colourPalette[1])
				.attr('cx', maxTextWidth + config.dotsize)
				.attr('cy', 26);
	
			var_group2
				.append('text')
				.attr('y', 30)
				.attr('x', 0)
				.attr('text-anchor', 'start')
				.attr('class', 'legendLabel')
				.attr('fill', config.colourPalette[1])
				.text(cometLegendLabels.max);
	
			var_group2
				.append('text')
				.attr('y', 30)
				.attr(
					'x',
					maxTextWidth +
						config.legendLineLength +
						config.dotsize +
						5
				)
				.attr('text-anchor', 'start')
				.attr('class', 'legendLabel')
				.attr('fill', config.colourPalette[1])
				.text(cometLegendLabels.min);
	
			var_group2
				.append('text')
				.attr('y', 15)
				.attr(
					'x',
					(maxTextWidth +
						config.legendLineLength +
						config.dotsize +
						minTextWidth) /
						2
				)
				.attr('text-anchor', 'middle')
				.attr('class', 'legendLabel')
				.attr('fill', config.colourPalette[1])
				.text('Decrease');
	
			//No change legend item
			var_group3
				.append('circle')
				.attr('r', config.dotsize)
				.attr('fill', config.colourPalette[2])
				.attr('cx', 10)
				.attr('cy', 26);
	
			var_group3
				.append('text')
				.attr('y', 30)
				.attr('x', config.dotsize + 15)
				.attr('text-anchor', 'start')
				.attr('class', 'legendLabel')
				.attr('fill', config.colourPalette[2])
				.text('No change');
		} //End drawLegend
	
	
	
	
		}//end drawComet
	
	function drawDot() {

	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height
	let height = config.seriesHeight[size] * graphic_data.length;

	
	let y = d3.scalePoint().padding(0.5).range([0, height]);

	//use the data to find unique entries in the name column
	y.domain(graphic_data.map((d) => d.name));

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(-chart_width).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.ticks(config.xAxisTicks[size])
		.tickFormat(d => d3.format(config.dataLabels.numberFormat)(d));

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(config.legendLabels, config.colourPalette)
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

	//create svg for chart
	svg = d3
		.select('#graphic')
		.append('svg')
		.attr('width', chart_width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')
		.style('background-color', '#fff')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


	svg
		.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'x axis')
		.call(xAxis)
		.selectAll('line')
		.each(function (d) {
			if (d == 0) {
				d3.select(this).attr('class', 'zero-line');
			}
		});

	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.attr('stroke-dasharray', '2 2')
		.selectAll('text')
		.call(wrap, margin.left - 5);

	svg
		.selectAll('circle.min')
		.data(graphic_data)
		.enter()
		.append('circle')
		.attr('class', 'min')
		.attr('r', 6)
		.attr('fill', config.colourPalette[0])
		.attr('cx', function (d) {
			return x(d.value);
		})
		.attr('cy', function (d) {
			return y(d.name);
		});

	svg
		.selectAll('circle.max')
		.data(graphic_data)
		.enter()
		.append('circle')
		.attr('class', 'max')
		.attr('r', 6)
		.attr('fill', config.colourPalette[1])
		.attr('cx', function (d) {
			return x(d.ref);
		})
		.attr('cy', function (d) {
			return y(d.name);
		});

	}//end drawDot

	function drawRange() {


		// Set up the legend
		let legenditem = d3
			.select('#legend')
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
		
		const colour = d3
			.scaleOrdinal()
			.range(config.colourPalette)
			.domain(Object.keys(config.legendLabels));
	
		// create the y scale in groups
		groups.map(function (d) {
			//height
			d[2] = config.seriesHeight[size] * d[1].length;
	
			// y scale
			d[3] = d3
				.scalePoint()
				.padding(0.5)
				.range([0, d[2]])
				.domain(d[1].map((d) => d.name));
			//y axis generator
			d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
		});
	
		//set up xAxis generator
		let xAxis = d3.axisBottom(x)
			.ticks(config.xAxisTicks[size])
			.tickFormat(d => d3.format(config.dataLabels.numberFormat)(d));
	
		divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');
	
		divs
			.append('p')
			.attr('class', 'groupLabels')
			.html((d) => d[0]);
	
			svgs = divs
			.append('svg')
			.attr('class', 'chart')
			.attr('height', (d) => d[2] + margin.top + margin.bottom)
			.attr('width', chart_width + margin.left + margin.right);
	
		charts = svgs
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	
		charts.each(function (d) {
			d3.select(this)
				.append('g')
				.attr('class', 'y axis')
				.call(d[4])
				.selectAll('text')
				.call(wrap, margin.left - 10);
	
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
		});
	
	
	
		charts
			.selectAll('line.between')
			.data((d) => d[1])
			.join('line')
			.attr('class', 'between')
			.attr('x1', (d) => x(d.value))
			.attr('x2', (d) => x(d.ref))
			.attr('y1', (d, i) => groups.filter((e) => e[0] == d.series)[0][3](d.name))
			.attr('y2', (d, i) => groups.filter((e) => e[0] == d.series)[0][3](d.name))
			.attr('stroke', '#c6c6c6')
			.attr('stroke-width', '3px');
	
		charts
			.selectAll('circle.min')
			.data((d) => d[1])
			.join('circle')
			.attr('class', 'min')
			.attr('cx', (d) => x(d.value))
			.attr('cy', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
			.attr('r', 6)
			.attr('fill', config.colourPalette[0]);
	
		charts
			.selectAll('circle.max')
			.data((d) => d[1])
			.join('circle')
			.attr('class', 'max')
			.attr('cx', (d) => x(d.ref))
			.attr('cy', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
			.attr('r', 6)
			.attr('fill', config.colourPalette[1]);
	
		if (config.dataLabels.show) {
			charts
				.selectAll('text.min')
				.data((d) => d[1])
				.join('text')
				.attr('class', 'dataLabels')
				.attr('x', (d) => x(d.value))
				.attr('y', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
				.text((d) => d3.format(config.dataLabels.numberFormat)(d.value))
				.attr('fill', config.colourPalette[0])
				.attr('dy', 6)
				.attr('dx', (d) => (+d.value < +d.ref ? -8 : 8))
				.attr('text-anchor', (d) => (+d.value < +d.ref ? 'end' : 'start'));
	
			charts
				.selectAll('text.max')
				.data((d) => d[1])
				.join('text')
				.attr('class', 'dataLabels')
				.attr('x', (d) => x(d.ref))
				.attr('y', (d) => groups.filter((f) => f[0] == d.series)[0][3](d.name))
				.text((d) => d3.format(config.dataLabels.numberFormat)(d.ref))
				.attr('fill', config.colourPalette[1])
				.attr('dy', 6)
				.attr('dx', (d) => (+d.value > +d.ref ? -8 : 8))
				.attr('text-anchor', (d) => (+d.value > +d.ref ? 'end' : 'start'));
		}
	
		
		// This does the x-axis label
		charts.each(function (d, i) {
			if (i == groups.length - 1) {
				d3.select(this)
					.append('text')
					.attr('x', chart_width)
					.attr('y', (d) => d[2] + 35)
					.attr('class', 'axis--label')
					.text(config.xAxisLabel)
					.attr('text-anchor', 'end');
			}
		});
	
	
		}//end drawRange
	
	//now draw the charts according to chart type from config.essential (bar, comet, dot or range)

	if (config.chartType == "bar") {drawBars()}
	
	if (config.chartType == "range") {drawRange()}

	if (config.chartType == "dot") {drawDot()}
	
	if (config.chartType == "comet") {drawComet()}

	
} //end drawGraphic

//create link to source
addSource('source', config.sourceText);

d3.csv(config.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;
	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
