import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.margin[size];
	margin.centre = config.margin.centre;
	let width = parseInt(graphic.style('width'));
	let chartWidth = parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.seriesHeight[size] * (graphicData.length / 2) +
		10 * (graphicData.length / 2 - 1) +
		12;

	// groups = d3.groups(graphicData, (d) => d.group)

	const stack = d3
		.stack()
		.keys(graphicData.columns.slice(2)) //Just the columns with data values
		.offset(d3[config.stackOffset])
		.order(d3[config.stackOrder]);

	let categoriesUnique = [...new Set(graphicData.map((d) => d.sex))];


	//y scale
	const y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(0.2)
		.range([0, height])
		.round(true);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphicData.map((d) => d.name))]);

	const y2 = d3
		.scaleBand()
		.range([0, y.bandwidth()])
		.padding(0.1)
		.domain(categoriesUnique);

	//y axis generator
	const yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

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

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

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
		.attr('transform', 'translate(' + 0 + ',' + 0 + ')')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10)
		.attr('text-anchor', 'end');

	svg
		.append('g')
		.selectAll('g')
		.data(seriesAll)
		.join('g')
		.attr('fill', (d, i) => config.colourPalette[i])
		.selectAll('rect')
		.data((d) => d)
		.join('rect')
		.attr('x', (d) => x(d[0]))
		.attr('y', (d) => y(d.data.name) + y2(d.data.sex))
		.attr('width', (d) => x(d[1]) - x(d[0]))
		.attr('height', y2.bandwidth());

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chartWidth,
		yPosition: height + 35,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chartWidth
	});


	// This does the Females label
	svg
		.append('g')
		.attr('transform', 'translate(0,0)')
		.append('text')
		.attr('x', 5)
		.attr(
			'y',
			// y.paddingOuter() * (1/(1-y.paddingInner()))*y.bandwidth() +
			// y2.paddingOuter() * (1/(1-y2.paddingInner()))*y2.bandwidth()
			y(seriesAll[0][0].data.name) + y2(seriesAll[0][0].data.sex)
		)
		.attr('dy', y2.bandwidth() / 2)
		.attr('dominant-baseline', 'middle')
		.attr('class', 'axis--label')
		.text('Females')
		.attr('text-anchor', 'start')
		.style('font-weight', 600)
		.style('font-size', '14px')
		.style('fill', '#fff');

	// This does the Males label
	svg
		.append('g')
		.attr('transform', 'translate(0,0)')
		.append('text')
		.attr('x', 5)
		.attr(
			'y',
			y(seriesAll[0][1].data.name) + y2(seriesAll[0][1].data.sex)
			// y.paddingOuter() * (1/(1-y.paddingInner()))*y.bandwidth() +
			// y2.paddingOuter() * (1/(1-y2.paddingInner()))*y2.bandwidth() +
			// 	y2.bandwidth() +
			// 	y2.paddingInner() * (1/(1-y2.paddingInner()))*y2.bandwidth() 
		)
		.attr('dy', y2.bandwidth() / 2)
		.attr('dominant-baseline', 'middle')
		.attr('class', 'axis--label')
		.text('Males')
		.attr('text-anchor', 'start')
		.style('font-weight', 600)
		.style('font-size', '14px')
		.style('fill', '#fff');

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
