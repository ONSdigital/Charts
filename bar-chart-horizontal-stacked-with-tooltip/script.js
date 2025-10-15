import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.margin[size];
	let chartWidth =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.seriesHeight[size] * graphicData.length +
		10 * (graphicData.length - 1) +
		12;

	//set up scales
	const x = d3.scaleLinear().range([0, chartWidth]);

	const y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(((graphicData.length - 1) * 10) / (graphicData.length * 30))
		.range([0, height])
		.round(true);

	const colour = d3
		.scaleOrdinal()
		.domain(graphicData.columns.slice(1))
		.range(config.colourPalette);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphicData.map((d) => d.name))]);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	const stack = d3
		.stack()
		.keys(graphicData.columns.slice(1))
		.offset(d3[config.stackOffset])
		.order(d3[config.stackOrder]);

	const series = stack(graphicData);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.xAxisTickFormat))
		.ticks(config.xAxisTicks[size]);

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	if (config.xDomain == 'auto') {
		x.domain(d3.extent(series.flat(2))); //flatten the arrays and then get the extent
	} else {
		x.domain(config.xDomain);
	}

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphicData.columns.slice(1), config.colourPalette)
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
		.attr('fill', (d, i) => config.colourPalette[i])
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
				.text(d3.format(config.tooltipFormat)((i[1] - i[0])))
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
		xPosition: chartWidth,
		yPosition: height + 35,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chartWidth
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
	graphicData = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
