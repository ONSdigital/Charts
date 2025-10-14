import { initialise, wrap, addSvg, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphicData, size, svg, columnNames, numbers, dataPivoted, breaks, colour, key, legendx;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
	let height =
		config.seriesHeight[size] * graphicData.length +
		3 * (graphicData.length - 1);

	columnNames = graphicData.columns.slice(1);

	const numbers = new Map();

	columnNames.forEach((item) => {
		numbers.set(
			item,
			graphicData.map((d) => +d[item])
		);
	});

	const breaks = new Map();

	dataPivoted = Array.from(
		pivot(graphicData, graphicData.columns.slice(1), 'region', 'value')
	);

	if (config.breaks == 'jenks') {
		columnNames.forEach((item) => {
			let temp = [];

			ss.ckmeans(numbers.get(item), config.numberOfBreaks).map(
				function (cluster, i) {
					if (i < config.numberOfBreaks - 1) {
						temp.push(cluster[0]);
					} else {
						temp.push(cluster[0]);
						//if the last cluster take the last max value
						temp.push(cluster[cluster.length - 1]);
					}
				}
			);
			breaks.set(item, temp);
		});
	} else if (config.breaks == 'equal') {
		columnNames.forEach((item) => {
			breaks.set(
				item,
				ss.equalIntervalBreaks(numbers.get(item), dvc.numberBreaks)
			);
		});
	} else {
		columnNames.forEach((item) => {
			breaks.set(item, config.breaks[item]);
		});
	}

	//set up scales
	const x = d3
		.scaleBand()
		.paddingOuter(0)
		.paddingInner(
			((columnNames.length - 1) * 10) /
				(chart_width - (columnNames.length - 1) * 10)
		)
		.range([0, chart_width])
		.round(true)
		.domain(columnNames);

	const y = d3
		.scaleBand()
		.paddingOuter(0)
		.paddingInner(((graphicData.length - 1) * 3) / (graphicData.length * 30))
		.range([0, height])
		.round(true);

	const colour = new Map();
	columnNames.forEach((item) => {
		colour.set(
			item,
			d3
				.scaleThreshold()
				.domain(breaks.get(item).slice(0, -1))
				.range(
					chroma
						.scale(chroma.brewer[config.colourPalette])
						.colors(config.numberOfBreaks)
				)
		);
	});

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphicData.map((d) => d.name))]);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3.axisTop(x).tickSize(0);

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	svg.append('g').attr('class', 'x axis').call(xAxis);

	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10);

	svg
		.append('g')
		.selectAll('rect')
		.data(dataPivoted)
		.join('rect')
		.attr('fill', (d) => colour.get(d.region)(+d.value))
		.attr('x', (d) => x(d.region))
		.attr('y', (d) => y(d.name))
		.attr('width', x.bandwidth())
		.attr('height', y.bandwidth());

	svg
		.append('g')
		.selectAll('text')
		.data(dataPivoted)
		.join('text')
		.attr('class', 'dataLabels')
		.attr('fill', (d) =>
			chroma.contrast(colour.get(d.region)(+d.value), '#fff') < 4.5
				? '#414042'
				: '#fff'
		)
		.attr('x', (d) => x(d.region))
		.attr('dx', x.bandwidth() / 2)
		.attr('y', (d) => y(d.name))
		.attr('dy', y.bandwidth() / 2 + 4)
		.attr('text-anchor', 'middle')
		.text((d) => d3.format(config.dataLabelsNumberFormat)(d.value));

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

// This is from bostock's notebook https://observablehq.com/d/ac2a320cf2b0adc4
// which is turn comes from this thread on wide to long data https://github.com/d3/d3-array/issues/142
function* pivot(data, columns, name, value, opts) {
	const keepCols = columns
		? data.columns.filter((c) => !columns.includes(c))
		: data.columns;
	for (const col of columns) {
		for (const d of data) {
			const row = {};
			keepCols.forEach((c) => {
				row[c] = d[c];
			});
			// TODO, add an option to ignore if fails a truth test to approximate `values_drop_na`
			row[name] = col;
			row[value] = d[col];
			yield row;
		}
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
