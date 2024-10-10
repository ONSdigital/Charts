import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.optional.seriesHeight[size] * graphic_data.length +
		10 * (graphic_data.length - 1) +
		12;

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	const y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
		.range([0, height])
		.round(true);

	const colour = d3
		.scaleOrdinal()
		.domain(graphic_data.columns.slice(1))
		.range(config.essential.colour_palette);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphic_data.map((d) => d.name))]);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	const stack = d3
		.stack()
		.keys(graphic_data.columns.slice(1))
		.offset(d3[config.essential.stackOffset])
		.order(d3[config.essential.stackOrder]);

	const series = stack(graphic_data);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.essential.xAxisTickFormat))
		.ticks(config.optional.xAxisTicks[size]);

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	if (config.essential.xDomain == 'auto') {
		x.domain(d3.extent(series.flat(2))); //flatten the arrays and then get the extent
	} else {
		x.domain(config.essential.xDomain);
	}

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphic_data.columns.slice(1), config.essential.colour_palette)
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
		.append('g')
		.selectAll('g')
		.data(series)
		.join('g')
		.attr('fill', (d, i) => config.essential.colour_palette[i])
		.selectAll('rect')
		.data((d) => d)
		.join('rect')
		.attr("class", "stackRects")
		.attr('x', (d) => Math.min(x(d[0]), x(d[1])))
		.attr('y', (d) => y(d.data.name))
		.attr('width', (d) => Math.abs(x(d[0]) - x(d[1])))
		.attr('height', y.bandwidth())
		.on("mousemove", function (d, i) {
			let xValue = parseFloat(d3.select(this).attr("x")) + d3.select(this).attr("width") / 2
			let yValue = parseFloat(d3.select(this).attr("y")) + d3.select(this).attr("height") / 2

			svg.selectAll(".stackRects")
				.attr("opacity", 0.2)

			d3.select(this).attr("opacity", 1)

			svg.select(".tooltipGroup")
				.attr("transform", "translate(" + xValue + "," + yValue + ")")

			svg.select(".tooltipGroup")
				.select("text")
				.text(d3.format(config.essential.tooltipFormat)((i[1] - i[0])))
		})
		.on("mouseleave", function (d, i) {

			svg.selectAll(".stackRects")
				.attr("opacity", 1)

			svg.select(".tooltipGroup")
				.attr("transform", "scale(0)")

		})

	let tooltipGroup = svg.append("g")
		.attr("class", "tooltipGroup")
		.attr("transform", "scale(0)")

	tooltipGroup.append("rect")
		.attr("x", -32)
		.attr("width", 64)
		.attr("y", -12)
		.attr("height", 24)
		.attr("stroke", "none")
		.attr("fill", "white")
		.attr("opacity", 0.9)
		.attr("pointer-events", "none")
		.attr("rx", "4px")

	tooltipGroup.append("text")
		.attr("x", 0)
		.attr("y", 5)
		.attr("text-anchor", "middle")
		.text("32.5%")
		.attr("stroke", "#414042")
		.attr("stroke-width", "0.5px")
		.attr("fill", "#414042")
		.attr("font-size", "14px")
		.attr("pointer-events", "none")
		.attr('class', 'tooltip-text')

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
		});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

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
