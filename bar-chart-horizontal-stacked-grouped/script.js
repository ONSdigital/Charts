import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.margin[size];
	margin.centre = config.margin.centre;

	let chartWidth = parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.seriesHeight[size] * graphicData.length +
		10 * (graphicData.length - 1) +
		12;

	let groups = d3.groups(graphicData, (d) => d.group);

	const stack = d3
		.stack()
		.keys(graphicData.columns.slice(2)) //Just the columns with data values
		.offset(d3[config.stackOffset])
		.order(d3[config.stackOrder]);

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.seriesHeight[size] * d[1].length;
		// y scale
		d[3] = d3
			.scaleBand()
			.paddingOuter(0.2)
			.paddingInner(0.25)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
		//stack
		d[5] = stack(d[1]);
	});

	//set up x scale
	const x = d3
		.scaleLinear()
		.range([0, chartWidth])
		.domain(config.xDomain);

	const seriesAll = stack(graphicData);

	if (config.xDomain == 'auto') {
		x.domain(d3.extent(seriesAll.flat(2))); //flatten the arrays and then get the extent
	} else {
		x.domain(config.xDomain);
	}

	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.xAxisTickFormat))
		// .tickFormat(d => d  + "%")
		.ticks(config.xAxisTicks[size]);

	let divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	//remove blank headings
	divs.selectAll('p').filter((d) => (d[0] == "")).remove()

	let charts = addSvg({
		svgParent: divs,
		chartWidth: chartWidth,
		height: (d) => d[2] + margin.top + margin.bottom,
		margin: margin
	})

	charts.each(function (d, i) {
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

		for (let j = 0; j < groups.length; j++) {
			if (i == j) {
				d3.select(this)
					.append('g')
					.attr('class', 'bars')
					.selectAll('g')
					.data((d) => d[5])
					.join('g')
					.attr('fill', (d, k) => config.colourPalette[k])
					.selectAll('rect')
					.data((d) => d)
					.join('rect')
					.attr('x', (d) => x(d[0]))
					.attr('y', (d) => groups[i][3](d.data.name))
					.attr('width', (d) => x(d[1]) - x(d[0]))
					.attr('height', groups[i][3].bandwidth());
			}
		}

		// This does the x-axis label - here only added to the last group
		if (i == groups.length - 1) {
			addAxisLabel({
				svgContainer: d3.select(this),
				xPosition: chartWidth,
				yPosition: d[2] + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chartWidth
			});
		}
	});

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphicData.columns.slice(2), config.colourPalette)
		)
		.enter()
		.append('div')
		.attr('class', 'legend--item');

	legenditem
		.append('div')
		.attr('class', 'legend--icon--circle')
		.style('background-color', (d) => d[1]);

	legenditem
		.append('div')
		.append('p')
		.attr('class', 'legend--text')
		.html((d) => d[0]);

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
