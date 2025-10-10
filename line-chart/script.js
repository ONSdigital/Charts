import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let graphic_data, size;

let pymChild = null;

function getXAxisTicks({
	data,
	xDataType,
	size,
	config
}) {
	let ticks = [];
	const method = config.xAxisTickMethod || "interval";
	if (xDataType === 'date') {
		const start = data[0].date;
		const end = data[data.length - 1].date;
		if (method === "total") {
			const count = config.xAxisTickCount ? config.xAxisTickCount[size] : 5;
			ticks = d3.scaleTime().domain([start, end]).ticks(count);
		} else if (method === "interval") {
			const interval = config.xAxisTickInterval || { unit: "year", step: { sm: 1, md: 1, lg: 1 } };
			const step = typeof interval.step === 'object' ? interval.step[size] : interval.step;
			let d3Interval;
			switch (interval.unit) {
				case "year":
					d3Interval = d3.timeYear.every(step);
					break;
				case "month":
					d3Interval = d3.timeMonth.every(step);
					break;
				case "quarter":
					d3Interval = d3.timeMonth.every(step * 3);
					break;
				case "day":
					d3Interval = d3.timeDay.every(step);
					break;
				default:
					d3Interval = d3.timeYear.every(1);
			}
			ticks = d3Interval.range(start, d3.timeDay.offset(end, 1));
		}
		if (!Array.isArray(ticks)) ticks = [];
		if (config.addFirstDate && !ticks.some(t => +t === +start)) {
			ticks.unshift(start);
		}
		if (config.addFinalDate && !ticks.some(t => +t === +end)) {
			ticks.push(end);
		}
	} else {
		// Numeric axis
		if (method === "total") {
			const count = config.xAxisTickCount[size] || 5;
			const extent = d3.extent(data, d => d.date);
			ticks = d3.ticks(extent[0], extent[1], count);
		} else if (method === "interval") {
			const interval = config.xAxisTickInterval || { unit: "number", step: { sm: 1, md: 1, lg: 1 } };
			const step = typeof interval.step === 'object' ? interval.step[size] : interval.step;
			const extent = d3.extent(data, d => d.date);
			let current = extent[0];
			while (current <= extent[1]) {
				ticks.push(current);
				current += step;
			}
		}
		if (!Array.isArray(ticks)) ticks = [];
		if (config.addFirstDate && !ticks.some(t => t === data[0].date)) {
			ticks.unshift(data[0].date);
		}
		if (config.addFinalDate && !ticks.some(t => t === data[data.length - 1].date)) {
			ticks.push(data[data.length - 1].date);
		}
	}
	// Remove duplicates and sort
	ticks = Array.from(new Set(ticks.map(t => +t))).sort((a, b) => a - b).map(t => xDataType === 'date' ? new Date(t) : t);
	return ticks;
}



function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);
	const aspectRatio = config.aspectRatio[size]

	// Define the dimensions and margin, width and height of the chart.
	let margin = config.margin[size];
	let chart_width = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (aspectRatio[1] / aspectRatio[0]) * chart_width;

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphic_data[0]).filter((k) => k !== 'date');

	let xDataType;

	if (Object.prototype.toString.call(graphic_data[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// Define the x and y scales

	let x;

	if (xDataType == 'date') {
		x = d3.scaleTime()
			.domain(d3.extent(graphic_data, (d) => d.date))
			.range([0, chart_width]);
	} else {
		x = d3.scaleLinear()
			.domain(d3.extent(graphic_data, (d) => +d.date))
			.range([0, chart_width]);
	}

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	let maxY, minY;

	if (config.yDomainMax === "auto") {
		maxY = d3.max(graphic_data, d => d3.max(categories, c => d[c]));
	} else {
		maxY = config.yDomainMax;
	}

	if (config.yDomainMin === "auto") {
		minY = d3.min(graphic_data, d => d3.min(categories, c => d[c]));
	} else {
		minY = config.yDomainMin;
	}

	// Ensure maxY is not less than minY
	if (maxY < minY) {
		const temp = maxY;
		maxY = minY;
		minY = temp;
	}

	y.domain([minY, maxY]);

	// Create an SVG element
	const svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	let labelData = [];

	// create lines and circles for each category
	categories.forEach(function (category, index) {
		const lineGenerator = d3
			.line()
			.x((d) => x(d.date))
			.y((d) => y(d[category]))
			.defined(d => d[category] !== null) // Only plot lines where we have values
			.curve(d3[config.lineCurveType]) // I used bracket notation here to access the curve type as it's a string
			.context(null);

		svg
			.append('path')
			.datum(graphic_data)
			.attr('fill', 'none')
			.attr(
				'stroke',
				config.colourPalette[
				categories.indexOf(category) % config.colourPalette.length
				]
			)
			.attr('stroke-width', 3)
			.attr('d', lineGenerator)
			.style('stroke-linejoin', 'round')
			.style('stroke-linecap', 'round');

		const lastDatum = graphic_data[graphic_data.length - 1];
		if (lastDatum[category] === null || (config.drawLegend || size === 'sm')) return;
		const label = svg.append('text')
			.attr('class', 'directLineLabel')
			.attr('x', x(lastDatum.date) + 10)
			.attr('y', y(lastDatum[category]))
			.attr('dy', '.35em')
			.attr('text-anchor', 'start')
			.attr('fill', config.textColourPalette[index % config.textColourPalette.length])
			.text(category)
			.call(wrap, margin.right - 10);
		const bbox = label.node().getBBox();
		labelData.push({
			node: label,
			x: x(lastDatum.date) + 10,
			y: y(lastDatum[category]),
			originalY: y(lastDatum[category]),
			height: bbox.height,
			category: category
		});
	});


		// size === 'sm'
		if (config.drawLegend || size === 'sm') {
			// Set up the legend
			let legenditem = d3
				.select('#legend')
				.selectAll('div.legend--item')
				.data(categories.map((c, i) => [c, config.colourPalette[i % config.colourPalette.length]]))
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
		} else {
		createDirectLabels(categories, graphic_data, svg, x, y, margin, size, config, chart_width);
		}
	

	// add grid lines to y axis
	svg
		.append('g')
		.attr('class', 'grid')
		.call(
			d3
				.axisLeft(y)
				.ticks(config.yAxisTicks[size])
				.tickSize(-chart_width)
				.tickFormat('')
		)
		.lower();

	d3.selectAll('g.tick line')
		.each(function (e) {
			if (e == config.zeroLine) {
				d3.select(this).attr('class', 'zero-line');
			}
		})

	// Add the x-axis
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3
				.axisBottom(x)
				.tickValues(getXAxisTicks({
					data: graphic_data,
					xDataType,
					size,
					config
				}))
				.tickFormat((d) => xDataType == 'date' ? d3.timeFormat(config.xAxisTickFormat[size])(d)
					: d3.format(config.xAxisNumberFormat)(d))
		);

	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y).ticks(config.yAxisTicks[size])
			.tickFormat(d3.format(config.yAxisNumberFormat))
			.tickSize(0));



	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -15,
		text: config.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chart_width
	});

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + margin.bottom - 25,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//create link to source
	addSource('source', config.sourceText);

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}

}

// Load the data
d3.csv(config.graphic_data_url).then((rawData) => {
	graphic_data = rawData.map((d) => {
		if (d3.timeParse(config.dateFormat)(d.date) !== null) {
			return {
				date: d3.timeParse(config.dateFormat)(d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		} else {
			return {
				date: (+d.date),
				...Object.entries(d)
					.filter(([key]) => key !== 'date')
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		}
	});

	// Use pym to create an iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});

});

function createDirectLabels(categories, graphic_data, svg, x, y, margin, size, config, chart_width) {

	// Remove any existing direct labels before adding new ones
    svg.selectAll('text.directLineLabel').remove();
    let labelData = [];
    const lastDatum = graphic_data[graphic_data.length - 1];
    categories.forEach(function (category, index) {
        if (lastDatum[category] === null) return;
        const label = svg.append('text')
            .attr('class', 'directLineLabel')
            .attr('x', x(lastDatum.date) + 10)
            .attr('y', y(lastDatum[category]))
            .attr('dy', '.35em')
            .attr('text-anchor', 'start')
            .attr('fill', config.textColourPalette[index % config.textColourPalette.length])
            .text(category)
            .call(wrap, margin.right - 10);
        const bbox = label.node().getBBox();
        labelData.push({
            node: label,
            x: x(lastDatum.date) + 10,
            y: y(lastDatum[category]),
            originalY: y(lastDatum[category]),
            height: bbox.height,
            category: category
        });
    });
    if (labelData.length > 1) {
        labelData.sort((a, b) => a.y - b.y);
        const minSpacing = 12;
        for (let i = 1; i < labelData.length; i++) {
            const current = labelData[i];
            const previous = labelData[i - 1];
            if (current.y - previous.y < minSpacing) {
                current.y = previous.y + minSpacing;
            }
        }
        labelData.forEach(label => {
            label.node.attr('y', label.y);
        });
    }
}