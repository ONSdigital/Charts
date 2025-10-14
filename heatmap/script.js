import { initialise, wrap, addSvg, addSource } from "../lib/helpers.js";

const graphic = d3.select('#graphic');
const legend = d3.select('#legend');
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

	numbers = graphicData
		.flatMap(function (d) {
			return Object.values(d)
				.map(Number)
				.filter((d) => !isNaN(d));
		})
		.sort(d3.ascending);

	dataPivoted = Array.from(
		pivot(graphicData, graphicData.columns.slice(1), 'region', 'value')
	);

	if (config.breaks == 'jenks') {
		breaks = [];

		ss.ckmeans(numbers, config.numberOfBreaks).map(function (
			cluster,
			i
		) {
			if (i < config.numberOfBreaks - 1) {
				breaks.push(cluster[0]);
			} else {
				breaks.push(cluster[0]);
				//if the last cluster take the last max value
				breaks.push(cluster[cluster.length - 1]);
			}
		});
	} else if (config.breaks == 'equal') {
		breaks = ss.equalIntervalBreaks(numbers, config.numberOfBreaks);
	} else {
		breaks = config.breaks;
	}

	//set up scales
	const x = d3
		.scaleBand()
		.paddingOuter(0)
		.paddingInner(
			((columnNames.length - 1) * 3) /
				(chart_width - (columnNames.length - 1) * 3)
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

	colour = d3
		.scaleThreshold()
		.domain(breaks.slice(1, 6))
		.range(
			Array.isArray(config.colourPalette)
				? config.colourPalette
				: chroma
					.scale(chroma.brewer[config.colourPalette])
					.colors(config.numberOfBreaks)
		);

	// draw a legend, stealing code from simple maps template
	legend.selectAll('*').remove();
	key = legend
		.append('svg')
		.attr('id', 'key')
		.attr('aria-hidden', true)
		.attr('width', chart_width + margin.left + margin.right)
		.attr('height', 75)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',35)');

	legendx = d3
		.scaleLinear()
		.domain([breaks[0], breaks[config.numberOfBreaks]])
		.range([0, chart_width]);

	key
		.append('g')
		.selectAll('rect.blocks')
		.data(
			colour.range().map((d, i) => {
				return {
					x0: legendx(breaks[i]),
					x1: legendx(breaks[i + 1]),
					fill: d
				};
			})
		)
		.join('rect')
		.attr('class', 'blocks')
		.attr('height', 10)
		.attr('x', (d) => d.x0)
		.attr('width', (d) => d.x1 - d.x0)
		.style('fill', (d) => d.fill);

	key
		.append('g')
		.attr('transform', 'translate(0,0)')
		.call(
			d3
				.axisBottom(legendx)
				.tickValues(breaks)
				.tickSize(15)
				.tickFormat(d3.format(config.legendFormat))
		);

	key
		.append('text')
		.attr('id', 'keytext')
		.attr('text-anchor', 'middle')
		.attr('dy', -12);

	key
		.append('g')
		.attr('id', 'keysymbol')
		.append('path')
		.attr('d', d3.symbol(d3.symbolTriangle))
		.attr('stroke', 'black')
		.attr('stroke-width', '2px')
		.attr('fill', 'white')
		.attr('opacity', 0);

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

	if (config.cascadeX === true) {
		d3.selectAll('g.x.axis text').each(function (d, i) {
			d3.select(this)
				.attr('dy', -20 * i)
				.attr('text-anchor', 'end')
				.attr('x', x.bandwidth() / 2);

			let bbox = this.getBBox();

			d3.select(this.parentNode)
				.append('line')
				.attr('x1', x.bandwidth() / 2 - 2)
				.attr('x2', x.bandwidth() / 2 - 2)
				.attr('y1', 0)
				.attr('y2', bbox.y + bbox.height)
				.attr('stroke', 'black')
				.attr('stroke-width', '3px');
		});
	} //end cascadeX if loop

		// Only run this functionality if config.xTicksAll is false
		if (!config.xTicksAll) {
			// Show ticks specified in xAxisTicks. If none are present, plot the first and last tick in the array, with the remaining n going in between.
			if (Array.isArray(config.xAxisTicks) && config.xAxisTicks.length > 0) {
				svg.select('.x.axis')
					.call(xAxis.tickValues(config.xAxisTicks));
			} else {
				// Generate ticks: always include first and last, and xAxisTicksAuto evenly spaced in between
				const domain = x.domain();
				const n = config.xAxisTicksAuto[size] || 2;
				let ticks = [];
				if (domain.length <= n) {
					ticks = domain;
				} else {
					const indices = Array.from({length: n}, (_, i) =>
						Math.round(i * (domain.length - 1) / (n - 1))
					);
					ticks = Array.from(new Set(indices.map(idx => domain[idx])));
					// Ensure the length matches n (in case of rounding duplicates)
					while (ticks.length < n) {
						// Fill in missing ticks if rounding caused duplicates
						for (let i = 0; i < domain.length && ticks.length < n; i++) {
							if (!ticks.includes(domain[i])) ticks.push(domain[i]);
						}
					}
					if (ticks.length > n) {
						ticks = ticks.slice(0, n);
					}
				}
				svg.select('.x.axis')
					.call(xAxis.tickValues(ticks));
			}
		}

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
		.attr('fill', (d) => colour(+d.value))
		.attr('x', (d) => x(d.region))
		.attr('y', (d) => y(d.name))
		.attr('width', x.bandwidth())
		.attr('height', y.bandwidth())
		.on('mouseover', function (d) {
			d3.select('#keytext')
				.text(
					d3.format(config.dataLabelsNumberFormat)(
						d3.select(this).data()[0].value
					)
				)
				.transition()
				.attr('x', legendx(+d3.select(this).data()[0].value));

			d3.select('#keysymbol path').attr('opacity', 1);

			d3.select('#keysymbol')
				.transition()
				.attr(
					'transform',
					'translate(' + legendx(+d3.select(this).data()[0].value) + ',0)'
				);
		})
		.on('mouseout', mouseout);

	svg
		.append('g')
		.selectAll('text')
		.data(dataPivoted)
		.join('text')
		.attr('class', 'dataLabels')
		.attr('fill', (d) => {
			// Calculate contrast ratio and decide text color
			const rectColor = colour(+d.value);
			const contrast = chroma.contrast(rectColor, '#ffffff');
			return contrast >= 4.5 ? '#ffffff' : '#414042'; // Use white if contrast is sufficient, otherwise dark gray
		})
		.attr('x', (d) => x(d.region))
		.attr('dx', x.bandwidth() / 2)
		.attr('y', (d) => y(d.name))
		.attr('dy', y.bandwidth() / 2 + 4)
		.attr('text-anchor', 'middle')
		.text((d) => d3.format(config.dataLabelsNumberFormat)(d.value))
		.attr('pointer-events', 'none');

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

function mouseout() {
	d3.select('#keytext').text('');
	d3.select('#keysymbol path').attr('opacity', 0);
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