import { initialise, wrap, addSvg, addAxisLabel } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.optional.margin[size];
	let chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = 400 - margin.top - margin.bottom;

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date');

	const colorScale = d3
		.scaleOrdinal()
		.domain(categories)
		.range(config.essential.colour_palette);

	// Set up the legend
	const legenditem = d3
		.select('#legend')
		.selectAll('div.legend--item')
		.data(d3.zip(categories, colorScale.range()))
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

	// Create an SVG element
	const svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// Define the x and y scales
	const x = d3
		.scaleTime()
		.domain(d3.extent(graphic_data, (d) => d.date))
		.range([0, chart_width]);

	// This function generates an array of approximately count + 1 uniformly-spaced, rounded values in the range of the given start and end dates (or numbers).
	let tickValues = x.ticks(config.optional.xAxisTicks[size]);

	// Add the first and last dates to the ticks array, and use a Set to remove any duplicates
	// tickValues = Array.from(new Set([graphic_data[0].date, ...tickValues, graphic_data[graphic_data.length - 1].date]));

	if (config.optional.addFirstDate == true) {
		tickValues.push(graphic_data[0].date)
		console.log("First date added")
	}

	if (config.optional.addFinalDate == true) {
		tickValues.push(graphic_data[graphic_data.length - 1].date)
		console.log("Last date added")
	}

	const y = d3
		.scaleLinear()
		.domain([0, 1]) // Assuming the y-axis represents the percentage from 0 to 1
		.range([height, 0]);

	// Define the stack generator
	const stack = d3
		.stack()
		.keys(categories) // Use the category names as keys
		.order(d3[config.essential.stackOrder]) // Use the stack order defined in the config later
		.offset(d3[config.essential.stackOffset]); // Convert to percentage values

	// Generate the stacked data
	const stackedData = stack(graphic_data);

	// console.log("stackedData:", stackedData);

	// Define the area generator
	const area = d3
		.area()
		.x((d) => x(d.data.date))
		.y0((d) => y(d[0]))
		.y1((d) => y(d[1]));

	// Create the areas
	svg
		.selectAll('path')
		.data(stackedData)
		.enter()
		.append('path')
		.attr('fill', (d) => {
			// Assign colors to each category
			const category = d.key;
			return colorScale(category);
		})
		.attr('d', area);

	// Add the x-axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(x)
				.tickFormat(d3.timeFormat(config.essential.xAxisTickFormat[size]))
				.tickValues(tickValues)
		);

	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y)
			.tickFormat(d3.format(config.essential.yAxisTickFormat)));

	//This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.essential.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: -(margin.left - 5),
		yPosition: -15,
		text: config.essential.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
	});

	//create link to source
	d3.select('#source').text('Source: ' + config.essential.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.essential.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
		return {
			date: d3.timeParse(config.essential.dateFormat)(d.date),
			...Object.entries(d)
				.filter(([key]) => key !== 'date')
				.map(([key, value]) => [key, +value])
				.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
		};
	});

	// console.log('Final data structure:',graphic_data);

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
