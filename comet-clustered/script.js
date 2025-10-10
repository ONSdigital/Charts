import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let legendTop = d3.select('#legendTop');
let pymChild = null;
let graphic_data, size, svg, xDomain;

// var minSym = d3.symbol() 
// .type(d3.symbolSquare).size(57)

function drawGraphic() {
	// clear out existing graphics
	legendTop.selectAll('*').remove();

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	let groups = d3.groups(graphic_data, (d) => d.group);

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

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);

	const colour = d3
		.scaleOrdinal()
		.range(config.colour_palette)
		.domain(Object.values(config.seriesLabels));


	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.seriesHeight[size] * d[1].length;

		// y scale
		d[3] = d3
			.scaleBand()
			.padding(0.5)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(9);
		d[5] = d3.scaleBand()
			.range([0, d[3].bandwidth()])
			.domain([...new Set(graphic_data.map(d => d.series))])
	});

	//set up xAxis generator
	let xAxis = d3.axisBottom(x)
		.ticks(config.xAxisTicks[size])
		.tickFormat(d3.format(config.xAxisNumberFormat));

	let divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	//remove blank headings
	divs.selectAll('p').filter((d) => (d[0] == "")).remove()

	let charts = addSvg({
		svgParent: divs,
		chart_width: chart_width,
		height: (d) => d[2] + margin.top + margin.bottom,
		margin: margin
	})

	charts.each(function (d) {
		d3.select(this)
			.append('g')
			.attr('class', 'y axis')
			.call(d[4])
			.selectAll('text')
			.call(wrap, margin.left - 12);


		d3.select(this)
			.append('g')
			.attr('transform', (d) => 'translate(0,' + (d[2] - 20) + ')')
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
		.attr('x1', (d) => x(d.min))
		.attr('x2', (d) => x(d.max))
		.attr('y1', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
		.attr('y2', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
		.attr('stroke', (d) => colour(d.series))
		.attr('stroke-width', '2px');

	console.log(colour("series0"))

	charts
		.selectAll('line.min')
		.data((d) => d[1])
		.join("line")
		.attr("class", "min")
		.attr("x1", (d) => x(d.min))
		.attr("x2", (d) => x(d.min))
		.attr("y1", (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) + (groups.filter(e => e[0] == d.group)[0][5].bandwidth() / 2))
		.attr("y2", (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) - (groups.filter(e => e[0] == d.group)[0][5].bandwidth() / 2))
		.attr('stroke', (d) => colour(d.series))
		.attr('stroke-width', '2.5px');

	charts
		.selectAll('circle.max')
		.data((d) => d[1])
		.join('circle')
		.attr('class', 'max')
		.attr('cx', (d) => x(d.max))
		.attr('cy', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series))
		.attr('r', config.dotsize)
		.attr('fill', (d) => colour(d.series));

	if (config.showDataLabels == true) {
		charts
			.selectAll('text.min')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.min) - 2)
			.attr('y', (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) - 1)
			.text((d) => config.numberSuffix + d3.format(config.numberFormat)(d.min))
			.attr("fill", config.colour_min_text)
			.attr('dy', 6)
			.attr('dx', (d) => (+d.min < +d.max ? -5 : 5))
			.attr('text-anchor', (d) => (+d.min < +d.max ? 'end' : 'start'));

		charts
			.selectAll('text.max')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.max))
			.attr('y', (d) => (groups.filter((f) => f[0] == d.group)[0][3](d.name) + groups.filter(e => e[0] == d.group)[0][5](d.series)) - 1)
			.text((d) => config.numberSuffix + d3.format(config.numberFormat)(d.max))
			.attr('fill', (d) => colour(d.series))
			.attr('dy', 6)
			.attr('dx', (d) =>
				+d.min > +d.max
					? -(config.dotsize + 5)
					: config.dotsize + 5
			)
			.attr('text-anchor', (d) => (+d.min > +d.max ? 'end' : 'start'))
			.style("font-weight", 700);
	}

	// This does the x-axis label
	charts.each(function (d, i) {
		if (i == groups.length - 1) {
			addAxisLabel({
				svgContainer: d3.select(this),
				xPosition: chart_width,
				yPosition: d[2] + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	});

	// Set up the legend
	var legenditemTop = d3.select('#legendTop')
		.selectAll('div.legend--item')
		.data(d3.zip(Object.values(config.seriesLabels), config.colour_palette))
		.enter()
		.append('div')
		.attr('class', 'legend--item')

	legenditemTop.append('div').attr('class', 'legend--icon--circle')
		.style('background-color', function (d) {
			return d[1]
		})

	legenditemTop.append('div')
		.append('p').attr('class', 'legend--text').html(function (d) {
			return d[0]
		})

	// // Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(config.legendItems)
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
		// var_group3 = d3
		// 	.select('#legend')
		// 	.selectAll('div.legend--item.No')
		// 	.append('svg')
		// 	.attr('height', config.legendHeight[size])
		// 	.attr('width', config.legendItemWidth);

		//Increase legend item
		var_group
			.append('text')
			.attr('y', 30)
			// .style("font-size", "12.5px")
			.attr('x', 0)
			.attr('text-anchor', 'start')
			.attr('class', 'mintext legendLabel')
			.attr('fill', config.legend_colour)
			.text(config.legendLabels.min);

		//this measures how wide the "min" value is so that we can place the legend items responsively
		let minTextWidth = d3.select('text.mintext').node().getBBox().width + 5;

		var_group
			.append('line')
			.attr('stroke', config.legend_colour)
			.attr('stroke-width', '3px')
			.attr('y1', 26)
			.attr('y2', 26)
			.attr('x1', minTextWidth)
			.attr('x2', minTextWidth + config.legendLineLength);

		var_group
			.append('circle')
			.attr('r', config.dotsize)
			.attr('fill', config.legend_colour)
			.attr('cx', minTextWidth + config.legendLineLength)
			.attr('cy', 26);

		// var_group
		// 	.append('circle')
		// 	.attr('r', config.dotsize - 2.5)
		// 	.attr('fill', config.legend_colour)
		// 	.attr('cx', minTextWidth + 1.25)
		// 	.attr('cy', 26);

		// var_group
		// .append("path")
		// .attr("d", minSym) 
		// .attr("fill", config.legend_colour) 
		// .attr("transform", "translate(" + (minTextWidth) + "," + 26 + ") rotate(45)");

		var_group
			.append("line")
			.attr("x1", minTextWidth)
			.attr("x2", minTextWidth)
			.attr("y1", 26 + 7)
			.attr("y2", 26 - 7)
			.attr('stroke', config.legend_colour)
			.attr('stroke-width', '2.5px');

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
			.attr('fill', config.legend_colour)
			.text(config.legendLabels.max)
			.style("font-weight", 700);

		//this measures how wide the "max" value is so that we can place the legend items responsively
		let maxTextWidth = d3.select('text.maxtext').node().getBBox().width + 5;

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
			.attr('fill', ONScolours.grey75)
			.text('Increase');

		//Decrease legend item
		var_group2
			.append('line')
			.attr('stroke', config.legend_colour)
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
			.attr('fill', config.legend_colour)
			.attr('cx', maxTextWidth + config.dotsize)
			.attr('cy', 26);

		var_group2
			.append("line")
			.attr("x1", maxTextWidth + config.legendLineLength + config.dotsize)
			.attr("x2", maxTextWidth + config.legendLineLength + config.dotsize)
			.attr("y1", 26 + 7)
			.attr("y2", 26 - 7)
			.attr('stroke', config.legend_colour)
			.attr('stroke-width', '2.5px');

		var_group2
			.append('text')
			.attr('y', 30)
			.attr('x', 0)
			.attr('text-anchor', 'start')
			.attr('class', 'legendLabel')
			.attr('fill', config.legend_colour)
			.text(config.legendLabels.max)
			.style("font-weight", 700);

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
			.attr('fill', config.legend_colour)
			.text(config.legendLabels.min);

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
			.text('Decrease')
			.attr('fill', ONScolours.grey75);

		// 	//No change legend item
		// 	var_group3
		// 		.append('circle')
		// 		.attr('r', config.dotsize)
		// 		.attr('fill', config.colour_palette[2])
		// 		.attr('cx', 10)
		// 		.attr('cy', 26);

		// 	var_group3
		// 		.append('text')
		// 		.attr('y', 30)
		// 		.attr('x', config.dotsize + 15)
		// 		.attr('text-anchor', 'start')
		// 		.attr('class', 'legendLabel')
		// 		.attr('fill', config.colour_palette[2])
		// 		.text('No change');
	} //End drawLegend

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
