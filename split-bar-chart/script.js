import { initialise, addSource} from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size, colour, plots, chart, headers, rows, splitBar, splitBarInner, finalrow;

function drawGraphic() {
	// Remove any existing chart elements
	graphic.selectAll('*').remove();
	legend.selectAll('*').remove();

	size = initialise(size);

	//population accessible summmary
	d3.select('#accessibleSummary').html(config.accessibleSummary);

	let formatNo = d3.format(config.numberFormat);

	// set up scale
	let x = d3
		.scaleLinear()
		.range([0, 100])
		.domain([
			d3.min([0, d3.min(graphicData, (d) => +d.value)]),
			d3.max(graphicData, (d) => +d.value)
		]);

	// nest data
	let groupedData = d3.groups(
		graphicData,
		(d) => d.plot,
		(d) => d.ycategory
	);

	// unique columns
	let xcategories = [...new Set(graphicData.map((d) => d.xcategory))];

	if (config.colourPaletteType == 'categorical') {
		colour = d3
			.scaleOrdinal()
			.range(config.colourPalette)
			.domain(xcategories);

		if (size == 'sm') {
			// Set up the legend
			let legenditem = d3
				.select('#legend')
				.selectAll('div.legend--item')
				.data(d3.zip(xcategories, config.colourPalette))
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
		}
	}

	// create div for each plot, here England, Wales
	plots = graphic
		.selectAll('div.plots')
		.data(groupedData)
		.join('div')
		.attr('class', 'plots');

	plots
		.append('p')
		.attr('class', 'plot--title')
		.html((d) => d[0]);

	// create a div for the chart
	chart = plots.append('div').attr('class', 'chart');

	if (size != 'sm') {
		// create a div for the headers
		headers = chart.append('div').attr('class', 'splitBar-label');

		// create div for the first square
		headers
			.append('div')
			.attr('class', 'rowLabel')
			.style('width', config.rowWidth[size] + 'px');

		// create divs for the rest of the column headers
		headers
			.append('div')
			.attr('class', 'headers')
			.style('width', `calc(100% - ${config.rowWidth[size]}px)`)
			.selectAll('div.column')
			.data(xcategories)
			.join('div')
			.attr('class', 'column')
			.style('width', 100 / xcategories.length + '%')
			.append('span')
			.html((d) => d);
	}

	// create divs as rows
	rows = chart
		.selectAll('div.rows')
		.data((d) => d[1])
		.join('div')
		.attr('class', 'splitBar-row');

	// first div as separate
	rows
		.append('div')
		.attr('class', 'rowLabel')
		.style('width', config.rowWidth[size] + 'px')
		.append('span')
		.style('text-align', 'right')
		.html((d) => d[0]);

	// then create another div to hold all split bars
	splitBar = rows
		.append('div')
		.attr('class', 'headers')
		.style('width', `calc(100% - ${config.rowWidth[size]}px)`)
		.selectAll('div.splitBar')
		.data((d) => d[1])
		.join('div')
		// then add a div for each x category
		.attr('class', 'column')
		.style('width', 100 / xcategories.length + '%');

	// divs for inside the splitBar
	splitBarInner = splitBar
		.append('div')
		.attr('class', 'splitBar-inner')
		// then div for the background
		.append('div')
		.attr('class', 'splitBar-inner--background');

	// add a div to help draw a line for 0
	splitBarInner
		.append('div')
		.attr('class', 'splitBar-bar--value')
		.style('left', 0)
		.style('width', x(0) + '%')
		.style('border-right', '1.5px solid #b3b3b3')
		.style('height', 'calc(100% + 15px)')
		.style('top', '-8px');

	// then div for the value
	splitBarInner
		.append('div')
		.attr('class', 'splitBar-bar--value')
		.style('left', (d) => (+d.value > 0 ? x(0) + '%' : x(+d.value) + '%'))
		.style('right', (d) =>
			+d.value > 0 ? 100 - x(+d.value) + '%' : 100 - x(0) + '%'
		)
		.style('background', function (d) {
			if (config.colourPaletteType == 'mono') {
				return config.colourPalette[0];
			} else if (config.colourPaletteType == 'divergent') {
				return +d.value > 0
					? config.colourPalette[0]
					: config.colourPalette[1];
			} else if (config.colourPaletteType == 'categorical') {
				return colour(d.xcategory);
			}
		})
		.append('div')
		// then a div to hold the value
		.attr('class', 'splitBar-bar--label')
		.style('margin-left', (d) => {
			if (d.value > 0) {
				return Math.abs(+x(d.value) - x(0)) < 20 ? '100%' : 'calc(100% - 35px)'; // you'll need to adjust these calcs if you want to move the text slightly left or right
			} else {
				return Math.abs(+x(d.value) - x(0)) > 20 ? '0%' : 'calc(0% - 35px)';
			}
		})
		.append('span')
		.style('color', (d) =>
			Math.abs(+x(d.value) - x(0)) < 20 ? '#222222' : '#fff'
		)
		.html((d) => formatNo(d.value));

	// final div for the zero indicator
	finalrow = chart.append('div').attr('class', 'finalRow');
	// first div as separate
	finalrow
		.append('div')
		.attr('class', 'rowLabel')
		.style('width', config.rowWidth[size] + 'px');

	finalrow
		.append('div')
		.attr('class', '')
		.style('margin-right', '-10px')
		.style('width', `calc(100% - ${config.rowWidth[size]}px)`)
		.style('display', 'inline-block')
		.selectAll('div.column')
		.data(xcategories)
		.join('div')
		.attr('class', 'column')
		.style('width', 100 / xcategories.length + '%')
		.style('padding-right', '8px')
		.style('display', 'inline-block')
		.append('span')
		.style('position', 'relative')
		.style('left', 'calc(' + x(0) + '%' + ' - 5px)')
		.html(0);

	// x-axis label
	finalrow
		.append('div')
		.attr('class', 'axis--label') 
		.style('width', '100%')
		.style('text-align', 'right') 
		.style('margin-top', '10px') 
		.style('padding-right', '10px') 
		.append('span')
		.style('white-space', 'nowrap') 
		.text(config.xAxisLabel);

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
