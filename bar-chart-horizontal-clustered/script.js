import { initialise, wrap, addSvg, addDataLabels, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let namesUnique = [...new Set(graphic_data.map((d) => d.name))];
	let categoriesUnique = [...new Set(graphic_data.map((d) => d.category))];

	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.seriesHeight[size] * graphic_data.length +
		14 * (namesUnique.length - 1) +
		(config.seriesHeight[size] * categoriesUnique.length + 14) * 0.2;


	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	const y = d3
		.scaleBand()
		.paddingOuter(0.1)
		.paddingInner(((namesUnique.length - 1) * 14) / (graphic_data.length * 28))
		.range([0, height])
		.round(true);

	//use the data to find unique entries in the name column
	y.domain(namesUnique);

	const y2 = d3
		.scaleBand()
		.range([0, y.bandwidth()])
		.padding(0)
		.domain(categoriesUnique);

	const colour = d3
		.scaleOrdinal()
		.range(config.colourPalette)
		.domain(categoriesUnique);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.dataLabels.numberFormat))
		.ticks(config.xAxisTicks[size]);

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
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	if (config.xDomain == 'auto') {
		if (d3.min(graphic_data.map(({ value }) => Number(value))) >= 0) {
			x.domain([
				0,
				d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
		} else {
			x.domain(d3.extent(graphic_data.map(({ value }) => Number(value))))
		}
	} else {
		x.domain(config.xDomain);
	}

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
		.selectAll('text')
		.call(wrap, margin.left - 10);

	svg
		.selectAll('rect')
		.data(graphic_data)
		.join('rect')
		.attr('x', d => d.value < 0 ? x(d.value) : x(0))
		.attr('y', (d) => y(d.name) + y2(d.category))
		.attr('width', (d) => Math.abs(x(d.value) - x(0)))
		.attr('height', y2.bandwidth())
		.attr('fill', (d) => colour(d.category));

	let labelPositionFactor = 7;

	if (config.dataLabels.show == true) {

		addDataLabels({
			svgContainer: svg,
			data: graphic_data,
			chart_width: chart_width,
			labelPositionFactor: 7,
			xScaleFunction: x,
			yScaleFunction: y,
			y2function: y2
		})
	} //end if for datalabels

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.graphicDataURL).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
