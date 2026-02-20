import { initialise, wrap, addSvg, addAxisLabel, addSource, createDirectLabels, getXAxisTicks, calculateAutoBounds, customTemporalAxis, drawIndexedLegendShape, drawIndexedLineEndMarker } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js";

let graphic = d3.select('#graphic');
let select = d3.select('#select');
let legend = d3.select('#legend');
let graphicData, size;

let pymChild = null;

function drawGraphic() {
	select.selectAll('*').remove(); // Remove the select element if it exists

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);
	const aspectRatio = config.aspectRatio[size]
	let margin = config.margin[size];
	let chartWidth = parseInt(graphic.style('width')) - margin.left - margin.right;
	let height = (aspectRatio[1] / aspectRatio[0]) * chartWidth;

	// Create an SVG element at the top so all functions can use it
	const svg = addSvg({
		svgParent: graphic,
		chartWidth: chartWidth,
		height: height + margin.top + margin.bottom,
		margin: margin
	});

	let uniqueOptions = [...new Set(graphicData.map((d) => d.series))];

	const dropdownData = uniqueOptions
		.slice()
		.sort((a, b) => (a || '').localeCompare(b || ''))
		.map((series) => ({
			id: series,
			label: series
		}));

	const selectControl = new EnhancedSelect({
		containerId: 'select',
		options: dropdownData,
		label: 'Choose a series',
		placeholder: 'Select a series',
		mode: 'default',
		idKey: 'id',
		labelKey: 'label',
		showClear: false,
		onChange: (selectedValue) => {
			if (selectedValue) {
				changeData(selectedValue.id);
			} else {
				clearChart();
			}
		}
	});

	// Clear the chart if no option is selected

	function clearChart() {
		// Clear the chart graphics
		svg.selectAll('path')
			// .transition().duration(2000)
			.attr('width', 0).remove();

		svg.selectAll('circle.line-end')
			// .transition().duration(2000)
			// .attr('r', 0)
			.remove();

		svg
			.selectAll('text.directLineLabel')
			// .transition()
			// .duration(1000)
			// .attr('x', -100)
			.remove();
	};

	// Function to change the data based on the selected option
	function changeData(selectedOption) {
		// Remove all existing lines and circles
		// svg.selectAll('path.line').remove();
		// svg.selectAll('circle.line-end').remove();
		// svg.selectAll('text.directLineLabel').remove();
		// svg.selectAll('line.label-leader-line').remove();

		d3.selectAll('.y.axis .tick').attr('opacity', 1); // Reveal y-axis ticks

		// Clear existing legend
		d3.select('#legend').selectAll('div.legend--item').remove();

	// Filter data for the selected option
	let filteredData = graphicData.filter((d) => d.series === selectedOption);
	if (filteredData.length === 0) return;

	// Get categories (series) for this option
	const categories = Object.keys(filteredData[0]).filter((k) => k !== 'date' && k !== 'series');

	// Set y domain using calculateAutoBounds
	// Use filtered data if freeYAxisScales is true, otherwise use all data
	if (config.yDomainMin === "auto" || config.yDomainMax === "auto" || config.yDomainMin === "data" || config.yDomainMax === "data") {
		const dataForBounds = config.freeYAxisScales ? filteredData : graphicData;
		const { minY, maxY } = calculateAutoBounds(dataForBounds, config);

		y.domain([minY, maxY]);

		// Update y axis
		svg.select('.y.axis.numeric')
			.transition()
			.duration(500)
			.call(d3.axisLeft(y).ticks(config.yAxisTicks[size])
				.tickFormat(d3.format(config.yAxisNumberFormat)));
		// Update grid lines
		svg.select('.grid')
			.transition()
			.duration(500)
			.call(
				d3.axisLeft(y)
					.ticks(config.yAxisTicks[size])
					.tickSize(-chartWidth)
					.tickFormat('')
			);
	}

	// Prepare data for binding - create array of objects with category info
    const lineData = categories.map((category, index) => ({
        category: category,
        index: index,
        data: filteredData,
        color: config.colourPalette[index % config.colourPalette.length]
    }));
    
    // Create line generator
    const lineGenerator = d3.line()
        .x((d) => x(d.date))
        .y((d) => y(d[lineData.category])) // This will be set per line
        .defined(d => d[lineData.category] !== null)
        .curve(d3[config.lineCurveType]);
    
    // LINES: Bind data and handle enter/update/exit
    const lines = svg.selectAll('path.line')
        .data(lineData, d => d.category); // Use category as key for object constancy
    
    // EXIT: Remove old lines
    lines.exit()
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
    
    // ENTER: Add new lines
    const linesEnter = lines.enter()
        .append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .style('stroke-linejoin', 'round')
        .style('stroke-linecap', 'round')
        .style('opacity', 0);
    
    // UPDATE + ENTER: Update all lines (both new and existing)
    const linesUpdate = linesEnter.merge(lines);
    
    linesUpdate
        .transition()
        .duration(500)
        .style('opacity', 1)
        .attr('stroke', d => d.color)
        .attr('d', d => {
            // Set the y accessor for this specific line
            const customLineGenerator = d3.line()
                .x((datum) => x(datum.date))
                .y((datum) => y(datum[d.category]))
                .defined(datum => datum[d.category] !== null)
                .curve(d3[config.lineCurveType]);
            return customLineGenerator(d.data);
        });
    
    // CIRCLES: Handle end-of-line circles
    const circleData = categories.map((category, index) => {
        const lastDatum = [...filteredData].reverse().find(d => d[category] != null && d[category] !== "");
        return {
            category: category,
            index: index,
            x: x(lastDatum.date),
            y: y(lastDatum[category]),
            color: config.colourPalette[index % config.colourPalette.length]
        };
    });
    
    // Remove all existing end markers (circles, rects, and diamond groups)
    svg.selectAll('circle.line-end').remove();
    svg.selectAll('rect.line-end').remove();
    svg.selectAll('g.line-end').remove();
    
	// Add new end markers with varying shapes
	circleData.forEach((d) => {
		drawIndexedLineEndMarker({
			svg,
			index: d.index,
			color: d.color,
			x: d.x,
			y: d.y,
			size: 4,
			diamondSize: 7,
		});
	});
    
    // LABELS AND LEADER LINES: Handle similarly if needed
    // Remove existing labels and leader lines with transition
    svg.selectAll('text.directLineLabel')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
    
    svg.selectAll('line.label-leader-line')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();

	// Handle legend vs direct labels
	if (config.drawLegend || size === 'sm') {
		// Create legend (moved outside the loop)
		let legenditem = d3
			.select('#legend')
			.selectAll('div.legend--item')
			.data(categories.map((c, i) => [c, config.colourPalette[i % config.colourPalette.length], i]))
			.enter()
			.append('div')
			.attr('class', 'legend--item');

		legenditem.each(function(d, i) {
			const item = d3.select(this);
			const svg = item.append('svg')
				.attr('width', 14)
				.attr('height', 14)
				.attr('viewBox', '0 0 12 12')
				.attr('class', 'legend--icon')
				.style('overflow', 'visible');

			drawIndexedLegendShape({
				svg,
				index: d[2],
				color: d[1],
				size: 4,
				diamondSize: 7,
			});
		});

		legenditem
			.append('div')
			.append('p')
			.attr('class', 'legend--text')
			.html(function (d) {
				return d[0];
			});
		} else {
			createDirectLabels({
				categories: categories,
				data: filteredData,
				svg: svg,
				xScale: x,
				yScale: y,
				margin: margin,
				chartHeight: height,
				config: config,
				options: {
					labelStrategy: 'lastValid',
					minSpacing: 15,
					useLeaderLines: true,
					leaderLineStyle: 'dashed',
					minLabelOffset: 5
				}
			});
		}
	}

	

	// Get categories from the keys used in the stack generator
	const categories = Object.keys(graphicData[0]).filter((k) => k !== 'date' && k !== 'series');

	let xDataType;

	if (Object.prototype.toString.call(graphicData[0].date) === '[object Date]') {
		xDataType = 'date';
	} else {
		xDataType = 'numeric';
	}

	// Define the x and y scales
	let x;
	if (xDataType == 'date') {
		x = d3.scaleTime()
			.domain(d3.extent(graphicData, (d) => d.date))
			.range([0, chartWidth]);
	} else {
		x = d3.scaleLinear()
			.domain(d3.extent(graphicData, (d) => +d.date))
			.range([0, chartWidth]);
	}

	const y = d3
		.scaleLinear()
		.range([height, 0]);

	// Set initial y domain
	// If freeYAxisScales is true and using auto, will be set in changeData for filtered data
	if (!config.freeYAxisScales || (config.yDomainMin !== "auto" && config.yDomainMin !== "data" && config.yDomainMax !== "auto" && config.yDomainMax !== "data")) {
		const { minY, maxY } = calculateAutoBounds(graphicData, config);
		y.domain([minY, maxY]);
	}

	// In drawGraphic, replace the x-axis tickValues logic:
	let xAxisGenerator;
	if (config.labelSpans.enabled === true && xDataType == 'date') {
		xAxisGenerator = customTemporalAxis(x)
			.tickSize(17)
			.tickPadding(6)
			.timeUnit(config.labelSpans.timeUnit)
			.secondaryTimeUnit(config.labelSpans.secondaryTimeUnit);
	} else {
		xAxisGenerator = d3
			.axisBottom(x)
			.tickValues(
				getXAxisTicks({
					data: graphic_data,
					xDataType,
					size,
					config
				})
			)
			.tickFormat(
				(d) =>
					xDataType == 'date' ?
						d3.timeFormat(config.xAxisTickFormat[size])(d) :
						d3.format(config.xAxisNumberFormat)(d)
			);
	}

	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxisGenerator); 

	// Add the y-axis
	svg
		.append('g')
		.attr('class', 'y axis numeric')
		.call(d3.axisLeft(y).ticks(config.yAxisTicks[size])
			.tickFormat(d3.format(config.yAxisNumberFormat)));



	// This does the y-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: 5 - margin.left,
		yPosition: -15,
		text: config.yAxisLabel,
		textAnchor: "start",
		wrapWidth: chartWidth
	});

	// This does the x-axis label
	addAxisLabel({
		svgContainer: svg,
		xPosition: chartWidth,
		yPosition: height + margin.bottom - 25,
		text: config.xAxisLabel,
		textAnchor: "end",
		wrapWidth: chartWidth
	});

	//create link to source
	addSource('source', config.sourceText);

	//if there is a default option, set it
	if (config.defaultOption) {
		const defaultOption = dropdownData.find((option) => option.id === config.defaultOption);
		if (defaultOption) {
			selectControl.select(defaultOption);
		} else {
			clearChart();
			selectControl.clear();
			d3.selectAll('.y.axis .tick').attr('opacity', 0); // Hide y-axis ticks
		}
	} else if (dropdownData.length > 0) {
		selectControl.select(dropdownData[0]);
	} else {
		// If no default option, clear the chart
		clearChart();
		selectControl.clear();
		d3.selectAll('.y.axis .tick').attr('opacity', 0); // Hide y-axis ticks
	}

	// Add grid lines to y axis (like line-chart template)
	svg
		.append('g')
		.attr('class', 'grid')
		.call(
			d3.axisLeft(y)
				.ticks(config.yAxisTicks[size])
				.tickSize(-chartWidth)
				.tickFormat('')
		)
		.lower();

	//use pym to calculate chart dimensions
	if (pymChild) {
		pymChild.sendHeight();
	}
}


// Load the data
d3.csv(config.graphicDataURL).then((rawData) => {
	graphicData = rawData.map((d) => {
		if (d3.utcParse(config.dateFormat)(d.date) !== null) {
			return {
				date: d3.utcParse(config.dateFormat)(d.date),
				series: d.series,
				...Object.entries(d)
					.filter(([key]) => key !== 'date' && key !== 'series') // Exclude 'date' and 'option' keys from the data
					.map(([key, value]) => [key, value == "" ? null : +value]) // Checking for missing values so that they can be separated from zeroes
					.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
			}
		} else {
			return {
				date: (+d.date),
				series: d.series,
				...Object.entries(d)
					.filter(([key]) => key !== 'date' && key !== 'series')
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
