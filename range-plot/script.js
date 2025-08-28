import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, groups, xDomain, divs, svgs, charts;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;

	groups = d3.groups(graphic_data, (d) => d.group);

	if (config.essential.xDomain == 'auto') {
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
		xDomain = config.essential.xDomain;
	}

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]).domain(xDomain);

	const colour = d3
		.scaleOrdinal()
		.range(config.essential.colour_palette)
		.domain(Object.keys(config.essential.legendLabels));

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * d[1].length;

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
		.ticks(config.optional.xAxisTicks[size])
		.tickFormat(d3.format(config.essential.xAxisTickFormat));

	divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	charts = addSvg({
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
		.attr('x1', (d) => x(d.min))
		.attr('x2', (d) => x(d.max))
		.attr('y1', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
		.attr('y2', (d, i) => groups.filter((e) => e[0] == d.group)[0][3](d.name))
		.attr('stroke', '#c6c6c6')
		.attr('stroke-width', '3px');

	if(config.essential.useDiamonds){
		charts
			.selectAll('rect.min')
			.data((d) => d[1])
			.join('rect')
			.attr('class', 'min')
			.attr('x', (d) => x(d.min)-5)
			.attr('y', (d) => groups.filter((f) => f[0] == d.group)[0][3](d.name)-5)
			.attr('width', 10)
			.attr('height', 10)
			.attr('transform', (d) => `rotate(45 ${x(d.min) +0} ${groups.filter((f) => f[0] == d.group)[0][3](d.name)-0})`)
			.attr('fill', colour('min'));
	}else{
		charts
			.selectAll('circle.min')
			.data((d) => d[1])
			.join('circle')
			.attr('class', 'min')
			.attr('cx', (d) => x(d.min))
			.attr('cy', (d) => Math.abs(x(d.max) - x(d.min)) < 3 ? groups.filter((f) => f[0] == d.group)[0][3](d.name) - 3 : groups.filter((f) => f[0] == d.group)[0][3](d.name))
			.attr('r', 6)
			.attr('fill', colour('min'));
	}

	

	charts
		.selectAll('circle.max')
		.data((d) => d[1])
		.join('circle')
		.attr('class', 'max')
		.attr('cx', (d) => x(d.max))
		.attr('cy', (d) => Math.abs(x(d.max) - x(d.min)) < 3 ? groups.filter((f) => f[0] == d.group)[0][3](d.name) + 3 : groups.filter((f) => f[0] == d.group)[0][3](d.name))
		.attr('r', 6)
		.attr('fill', colour('max'));

	if (config.essential.showDataLabels) {
		charts
			.selectAll('text.min')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.min))
			.attr('y', (d) => Math.abs(x(d.max) - x(d.min)) < 3 ? groups.filter((f) => f[0] == d.group)[0][3](d.name) - 3 : groups.filter((f) => f[0] == d.group)[0][3](d.name))
			.text((d) => d3.format(config.essential.numberFormat)(d.min))
			.attr('fill', colour('min'))
			.attr('dy', 6)
			.attr('dx', (d) => (+d.min < +d.max ? -8 : 8))
			.attr('text-anchor', (d) => (+d.min < +d.max ? 'end' : 'start'));

		charts
			.selectAll('text.max')
			.data((d) => d[1])
			.join('text')
			.attr('class', 'dataLabels')
			.attr('x', (d) => x(d.max))
			.attr('y', (d) => Math.abs(x(d.max) - x(d.min)) < 3 ? groups.filter((f) => f[0] == d.group)[0][3](d.name) + 3 : groups.filter((f) => f[0] == d.group)[0][3](d.name))
			.text((d) => d3.format(config.essential.numberFormat)(d.max))
			.attr('fill', colour('max'))
			.attr('dy', 6)
			.attr('dx', (d) => (+d.min > +d.max ? -8 : 8))
			.attr('text-anchor', (d) => (+d.min > +d.max ? 'end' : 'start'));
	}



	// This does the x-axis label
	charts.each(function (d, i) {
		if (i == groups.length - 1) {
			addAxisLabel({
				svgContainer: d3.select(this),
				xPosition: chart_width,
				yPosition: d[2] + 35,
				text: config.essential.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}
	});

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(
				Object.values(config.essential.legendLabels),
				config.essential.colour_palette
			)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', (d,i)=>config.essential.useDiamonds && i==0 ? 'legend--icon--diamond' : 'legend--icon--circle')
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
	addSource('source', config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
