import { initialise, wrap, addSvg, addDataLabels, addAxisLabel, addSource } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let select = d3.select('#select');
let pymChild = null;
let x, y, graphic_data, size, svg;


function drawGraphic() {

	select.selectAll('*').remove(); // Remove the select element if it exists


	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

	let uniqueOptions = [...new Set(graphic_data.map((d) => d.option))];

	console.log(`dropdownData contains: ${JSON.stringify(uniqueOptions)}`);

	const optns = select
		.append('div')
		.attr('id', 'sel')
		.append('select')
		.attr('id', 'optionsSelect')
		.attr('style', 'width:calc(100% - 6px)')
		.attr('class', 'chosen-select')
		.attr('data-placeholder', 'Select an option');

	optns
		.selectAll('option.option')
		.data(uniqueOptions)
		.enter()
		.append('option')
		.attr('value', (d) => d)
		.text((d) => d);


	//add some more accessibility stuff
	d3.select('input.chosen-search-input').attr('id', 'chosensearchinput');
	d3.select('div.chosen-search')
		.insert('label', 'input.chosen-search-input')
		.attr('class', 'visuallyhidden')
		.attr('for', 'chosensearchinput')
		.html('Type to select an area');


	$('#optionsSelect').trigger('chosen:updated');  // Initialize Chosen

	let labelPositions = new Map();  // Create a map to store label positions

	$('#optionsSelect').chosen().change(function () {
		const selectedOption = $(this).val();
		console.log(`Selected option: ${selectedOption}`);

		if (selectedOption) {
			changeData(selectedOption);

		} else {
			// Clear the chart if no option is selected
			clearChart();
		}
	});

	// Clear the chart if no option is selected

	function clearChart() {
		// Clear the chart graphics
		svg.selectAll('rect').transition().duration(2000).attr('width', 0).remove();

		svg
			.selectAll('text.dataLabels')
			.transition()
			.duration(1000)
			.attr('x', -100)
			.remove();
	};

	function changeData(selectedOption) {

		let filteredData = graphic_data.filter(
			(d) => d.option === selectedOption
		)

			// Sort the data 
			.sort((a, b) => y.domain().indexOf(a.name) - y.domain().indexOf(b.name));

		console.log('Filtered data:', filteredData);


		// Update the y scale domain based on the filtered data
		y.domain(filteredData.map((d) => d.name));

		// Update the y axis with the new domain
		svg
			.select('y axis')
			.transition()
			.duration(2000)
			.call(yAxis)
			.selectAll('text')
			.call(wrap, margin.left - 10);

		// Store the current positions of the labels in the map
		svg.selectAll('text.dataLabels').each(function (d) {
			labelPositions.set(d.name, x(d.value));
		});

		// Enter and update
		let bars = svg.selectAll('rect').data(filteredData, (d) => d.name);

		// Exit
		bars.exit().transition().duration(400).ease(d3.easeCubic).attr('width', 0).remove();

		// Enter and update
		bars
			.enter()
			.append('rect')
			// .attr('x', x(0))
			.attr('x', d => d.value < 0 ? x(d.value) : x(0))
			.attr('y', (d) => y(d.name))
			// .attr('width', 0)
			.attr('width', d => d.value < 0 ? Math.abs(x(d.value) - x(0)) : x(d.value) - x(0))
			.attr('height', y.bandwidth())
			.attr('fill', config.colourPalette)
			.merge(bars)
			.transition()
			.duration(1250)
			.ease(d3.easeCubic)
			// .attr('width', (d) => x(d.value) - x(0));
			.attr('width', d => d.value < 0 ? Math.abs(x(d.value) - x(0)) : x(d.value) - x(0))
			.attr('x', d => d.value < 0 ? x(d.value) : x(0));


		// Update the data labels
		if (config.dataLabels.show === true) {
			addDataLabels({
				svgContainer: svg,
				data: filteredData,
				chart_width: chart_width,
				labelPositionFactor: 7,
				xScaleFunction: x,
				yScaleFunction: y
			})

			svg
				.selectAll('text.dataLabels')
				.transition()
				.duration(1200)
				.ease(d3.easeCubic)
				.tween('text', function (d) {
					// Parse this.textContent as a float and multiply it by 0.001 to get the start value. This need to match the data.
					let startValue = parseFloat(this.textContent) * 0.001;

					// Create an interpolator
					const i = d3.interpolate(startValue, d.value);

					// Create a position interpolator
					const xi = d3.interpolate(labelPositions.get(d.name) || x(0), x(d.value) - (x(d.value) - x(0) < chart_width / 10 ? -3 : 3));

					return function (t) {
						// Calculate the interpolated value
						let interpolatedValue = i(t);

						// Update the label's text
						this.textContent = d3.format(config.dataLabels.numberFormat)(interpolatedValue);

						// Update the label's x position
						d3.select(this).attr('x', xi(t));
					};
				});
		}

	}

	let margin = config.margin[size];
	let chart_width =
		parseInt(graphic.style('width')) - margin.left - margin.right;
	//height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion

	let uniqueNames = [...new Set(graphic_data.map((d) => d.name))];
	let height =
		config.seriesHeight[size] * uniqueNames.length +
		10 * (uniqueNames.length - 1) +
		12;

	//set up scales
	x = d3.scaleLinear().range([0, chart_width]);

	y = d3
		.scaleBand()
		.paddingOuter(0.2)
		.paddingInner(((graphic_data.length - 1) * 10) / (graphic_data.length * 30))
		.range([0, height])
		.round(true);

	//use the data to find unique entries in the name column
	y.domain([...new Set(graphic_data.map((d) => d.name))]);

	//set up yAxis generator
	let yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);

	//set up xAxis generator
	let xAxis = d3
		.axisBottom(x)
		.tickSize(-height)
		.tickFormat(d3.format(config.dataLabels.numberFormat))
		.ticks(config.xAxisTicks[size]);

	//create svg for chart
	svg = addSvg({
		svgParent: graphic,
		chart_width: chart_width,
		height: height + margin.top + margin.bottom,
		margin: margin
	})

	// Append y-axis to SVG
	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.selectAll('text')
		.call(wrap, margin.left - 10);

	if (config.xDomain == 'auto') {
		if (d3.min(graphic_data.map(({ value }) => Number(value))) >= 0) {
			x.domain([
				0,
				d3.max(graphic_data.map(({ value }) => Number(value)))]); //modified so it converts string to number
		} else {
			x.domain(d3.extent(graphic_data.map(({ value }) => Number(value))))
		}
	} else {
		x.domain(config.xDomain);
	}


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

	console.log(`Length of graphic_data: ${graphic_data.length}`);


	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chart_width,
		yPosition: height + 35,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chart_width
	});

	//create link to source
	addSource('source', config.sourceText);

	$('#optionsSelect').val(config.defaultOption).trigger('chosen:updated');
	changeData(config.defaultOption)
	// updateLegend("Agriculture, forestry and fishing", 0)

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}

d3.csv(config.graphicDataURL).then((data) => {
	//load chart data
	graphic_data = data;

	//use pym to create iframed chart dependent on specified variables
	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
