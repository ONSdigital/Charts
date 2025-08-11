import { initialise, wrap, addSvg, addAxisLabel } from "https://cdn.ons.gov.uk/assets/data-vis-charts/v1/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.optional.margin[size];
	margin.centre = config.optional.margin.centre;
	let chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.optional.seriesHeight[size] * (graphic_data.length / 2) +
		10 * (graphic_data.length / 2 - 1) +
		12;

	let groups = d3.groups(graphic_data, (d) => d.group);

	const stack = d3
		.stack()
		.keys(graphic_data.columns.slice(3)) //Just the columns with data values
		.offset(d3[config.essential.stackOffset])
		.order(d3[config.essential.stackOrder]);

	let categoriesUnique = [...new Set(graphic_data.map((d) => d.sex))];


	// create the y scale in groups
	groups.map(function (d) {
		//height
		d[2] = config.optional.seriesHeight[size] * d[1].length;
		// y scale
		d[3] = d3
			.scaleBand()
			.paddingOuter(0.1)
			.paddingInner(0.1)
			.range([0, d[2]])
			.domain(d[1].map((d) => d.name));
		//y axis generator
		d[4] = d3.axisLeft(d[3]).tickSize(0).tickPadding(10);
		//stack
		d[5] = stack(d[1]);
		//y2
		d[6] = d3
			.scaleBand()
			.range([0, d[3].bandwidth()])
			.padding(0.1)
			.domain(categoriesUnique);
	});

	//set up x scale
	const x = d3
		.scaleLinear()
		.range([0, chart_width])
		.domain(config.essential.xDomain);

	const seriesAll = stack(graphic_data);

	if (config.essential.xDomain == 'auto') {
		x.domain(d3.extent(seriesAll.flat(2))); //flatten the arrays and then get the extent
	} else {
		x.domain(config.essential.xDomain);
	}

	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.essential.xAxisTickFormat))
		// .tickFormat(d => d  + "%")
		.ticks(config.optional.xAxisTicks[size]);

	let divs = graphic.selectAll('div.categoryLabels').data(groups).join('div');

	if (groups.length > 1) { divs.append('p').attr('class', 'groupLabels').html((d) => d[0]) }

	//remove blank group headings
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
					.attr('fill', (d, k) => config.essential.colour_palette[k])
					.selectAll('rect')
					.data((d) => d)
					.join('rect')
					.attr('x', (d) => x(d[0]))
					.attr(
						'y',
						(d) => groups[i][3](d.data.name) + groups[i][6](d.data.sex)
					)
					.attr('width', (d) => x(d[1]) - x(d[0]))
					.attr('height', groups[i][6].bandwidth());
			}
		}

		// This does the x-axis label - here only added to the last group
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

		// This does the Females label
		d3.select(this)
			.append('g')
			.attr('transform', 'translate(0,0)')
			.append('text')
			.attr('x', 5)
			.attr(
				'y',
				groups[i][3].paddingOuter() * (1 / (1 - groups[i][3].paddingInner())) * groups[i][3].bandwidth() +
				groups[i][6].paddingOuter() * (1 / (1 - groups[i][6].paddingInner())) * groups[i][6].bandwidth()
			)
			.attr('dy', groups[i][6].bandwidth() / 2)
			.attr('dominant-baseline', 'middle')
			.attr('class', 'axis--label')
			.text('Females')
			.attr('text-anchor', 'start')
			.style('font-weight', 600)
			.style('font-size', '14px')
			.style('fill', '#fff');

		// This does the Males label
		d3.select(this)
			.append('g')
			.attr('transform', 'translate(0,0)')
			.append('text')
			.attr('x', 5)
			.attr(
				'y',
				groups[i][3].paddingOuter() * (1 / (1 - groups[i][3].paddingInner())) * groups[i][3].bandwidth() +
				groups[i][6].paddingOuter() * (1 / (1 - groups[i][6].paddingInner())) * groups[i][6].bandwidth() +
				groups[i][6].bandwidth() +
				groups[i][6].paddingInner() * (1 / (1 - groups[i][6].paddingInner())) * groups[i][6].bandwidth()
			)
			.attr('dy', groups[i][6].bandwidth() / 2)
			.attr('dominant-baseline', 'middle')
			.attr('class', 'axis--label')
			.text('Males')
			.attr('text-anchor', 'start')
			.style('font-weight', 600)
			.style('font-size', '14px')
			.style('fill', '#fff');
	});

	// Set up the legend
	let legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(
			d3.zip(graphic_data.columns.slice(3), config.essential.colour_palette)
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
