import { initialise, wrap, addSvg, addDataLabels, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let namesUnique = [...new Set(graphicData.map((d) => d.name))];
	let categoriesUnique = [...new Set(graphicData.map((d) => d.category))];

	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.seriesHeight[size] * graphicData.length +
		14 * (namesUnique.length - 1) +
		(config.seriesHeight[size] * categoriesUnique.length + 14) * 0.2;

	//grouping the data
	let groups = d3.groups(graphicData, (d) => d.group)

	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.seriesHeight[size] * [...new Set(d[1].map((d) => d.name))].length //height determined based on number of unique names on y axis
		// y scale
		d[3] = d3.scaleBand()
			.paddingOuter(0.1)
			.paddingInner(([...new Set(d[1].map((d) => d.name))].length - 1) * 14 / (d[1].length * 28))
			.range([0, d[2]])
			.domain(d[1].map(d => d.name));

		//y axis generator
		d[4] = d3.axisLeft(d[3])
			.tickSize(0)
			.tickPadding(10);
		//y2
		d[5] = d3.scaleBand()
			.range([0, d[3].bandwidth()])
			.padding(0)
			.domain(categoriesUnique)
	});

	//set up scales
	const x = d3.scaleLinear().range([0, chart_width]);

	if (config.xDomain == 'auto') {
		if (d3.min(graphicData.map(({ value }) => Number(value))) >= 0) {
			x.domain([
				0,
				d3.max(graphicData.map(({ value }) => Number(value)))]); //modified so it converts string to number
		} else {
			x.domain(d3.extent(graphicData.map(({ value }) => Number(value))))
		}
	} else {
		x.domain(config.xDomain);
	}

	const colour = d3
		.scaleOrdinal()
		.range(config.colourPalette)
		.domain(categoriesUnique);


	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.dataLabels.numberFormat))
		.ticks(config.xAxisTicks[size]);

	let divs = graphic.selectAll('div.categoryLabels')
		.data(groups)
		.join('div')

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	//remove any blank headings
	divs.selectAll('p').filter((d) => (d[0] == "")).remove()

	let charts = addSvg({
		svgParent: divs,
		chart_width: chart_width,
		height: (d) => d[2] + margin.top + margin.bottom,
		margin: margin
	})

	charts.each(function (d, i) {

		d3.select(this)
			.append('g')
			.attr('class', 'y axis')
			.call(d[4])
			.selectAll('text')
			.call(wrap, margin.left - 10)

		d3.select(this)
			.append('g')
			.attr('transform', (d) => 'translate(0,' + d[2] + ')')
			.attr('class', 'x axis')
			.each(function () {
				d3.select(this).call(xAxis.tickSize(-d[2]))
					.selectAll('line').each(function (e) {
						if (e == 0) {
							d3.select(this)
								.attr('class', 'zero-line')
						};
					})
			})

		// charts.selectAll('rect')
		d3.select(this).selectAll('rect')
			.data((d) => d[1])
			.join('rect')
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => groups[i][3](d.name) + groups[i][5](d.category))
			.attr('width', (d) => Math.abs(x(d.value) - x(0)))
			.attr('height', (d) => groups[i][5].bandwidth())
			.attr("fill", (d) => colour(d.category));

		//adding data labels to the bars - only if two categories or fewer
		if (config.dataLabels.show == true && categoriesUnique.length <= 2) {

			addDataLabels({
				svgContainer: d3.select(this),
				data: (d) => d[1],
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: groups[i][3],
				y2function: groups[i][5]
			})
		} //end if for datalabels


		// This does the x-axis label - here only added to the last group
		if (i == (groups.length - 1)) {
			addAxisLabel({
				svgContainer: d3.select(this),
				xPosition: chart_width,
				yPosition: d[2] + 35,
				text: config.xAxisLabel,
				textAnchor: "end",
				wrapWidth: chart_width
			});
		}

	})


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
