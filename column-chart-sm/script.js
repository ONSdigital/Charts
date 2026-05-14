import {
	initialise,
	wrap,
	addSvg,
	addChartTitleLabel,
	addAxisLabel,
	addSource,
	customTemporalAxis,
	prefixYearFormatter,
	diamondShape
} from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let pymChild = null;
let graphicData, size;
let rawColumns = []; // column order preserved from d3.csv parse (needed for stacked key order)

function drawGraphic() {

	// Sets accessible summary, clears #graphic, and returns 'sm', 'md', or 'lg'
	size = initialise(size);

	// Re-select after initialise clears #graphic children
	graphic = d3.select('#graphic');

	const featured = config.featuredChart || {};
	const isFeatured = !!(featured.series);

	// ── Stacked columns ─────────────────────────────────────────────────────
	// For stacked mode, determine which columns form the stack segments.
	// These are all non-date, non-series columns in their original CSV order.
	// The lineSeries column (if any) is excluded from the stack and drawn as an overlay.
	const isStacked = !!(config.stacked);
	let stackColumns = [];
	if (isStacked) {
		stackColumns = rawColumns.filter(c => c !== 'date' && c !== 'series');
		if (config.lineSeries) {
			stackColumns = stackColumns.filter(c => c !== config.lineSeries);
		}
	}

	// ── Group data by series ─────────────────────────────────────────────────
	const nestedData = d3.groups(graphicData, d => d.series);

	const featuredEntry = isFeatured
		? nestedData.find(([k]) => k === featured.series)
		: null;
	const regularEntries = isFeatured
		? nestedData.filter(([k]) => k !== featured.series)
		: nestedData;

	// Global x domain — ensures all panels share the same x axis regardless of
	// which dates appear in individual series (important for stacked charts).
	const globalXDomain = [...new Set(graphicData.map(d => d.date))];

	// ── Layout configuration ────────────────────────────────────────────────
	const chartsPerRow = config.chartEvery[size];
	const margin = config.margin[size];
	const chartGap = config.chartGap || 10;
	const screenWidth = parseInt(graphic.style('width'));
	const aspectRatio = config.aspectRatio[size];

	const featuredPosition = featured.position || 'left';
	const featuredColSpan = featured.colSpan || 1;
	const featuredRowSpan = featured.rowSpan || 1;

	// Left margin used by non-first regular charts
	const effectiveGap = (config.dropYAxis && !config.freeYAxisScales)
		? chartGap : margin.left;

	// ── Grid geometry ───────────────────────────────────────────────────────
	const totalGridCols = (isFeatured && featuredPosition === 'left')
		? featuredColSpan + chartsPerRow
		: chartsPerRow;

	const colWidth = screenWidth / totalGridCols;

	// ── Chart dimensions ────────────────────────────────────────────────────
	// Solve for unit_width so all regular charts have identical plot-area widths.
	// One row of chartsPerRow regular columns must fill chartsPerRow × colWidth:
	//   (margin.left + unit + margin.right) + (chartsPerRow-1)×(effectiveGap + unit + margin.right)
	//   = chartsPerRow × colWidth
	//   → unit = colWidth - margin.right - (margin.left + (chartsPerRow-1)×effectiveGap) / chartsPerRow
	const regularChartWidth = colWidth - margin.right
		- (margin.left + (chartsPerRow - 1) * effectiveGap) / chartsPerRow;
	const regularHeight = (aspectRatio[1] / aspectRatio[0]) * regularChartWidth;
	const regularSVGHeight = regularHeight + margin.top + margin.bottom;

	// Featured chart spans featuredColSpan grid columns — its plot area is
	// naturally featuredColSpan times wider than a single regular chart column.
	const featuredChartWidth = (featuredPosition === 'left')
		? colWidth * featuredColSpan - margin.left - margin.right
		: screenWidth - margin.left - margin.right;
	const featuredHeight = featuredRowSpan * regularSVGHeight - margin.top - margin.bottom;

	// ── Apply CSS Grid layout ───────────────────────────────────────────────
	graphic
		.style('display', 'grid')
		.style('grid-template-columns', `repeat(${totalGridCols}, 1fr)`)
		.style('gap', '0');

	// ── Y-domain helpers ────────────────────────────────────────────────────
	// For stacked mode, domain comes from the full extent of the stacked series
	// (d3.stack output is [[low,high], ...] per layer, so .flat(2) gets all values).
	// For simple mode, domain is [0 or min, max] of the single value column.
	function buildStack(data) {
		return d3.stack()
			.keys(stackColumns)
			.offset(d3[config.stackOffset || 'stackOffsetNone'])
			.order(d3[config.stackOrder || 'stackOrderNone'])(data);
	}

	function calcYDomain(dataSubset) {
		if (config.yDomain && config.yDomain !== 'auto') return config.yDomain;
		if (isStacked) {
			const extent = d3.extent(buildStack(dataSubset).flat(2));
			// Extend to cover line series values so the overlay is never clipped
			if (config.showMarkers && config.lineSeries) {
				const lineVals = dataSubset
					.map(d => d[config.lineSeries])
					.filter(v => v != null && !isNaN(v));
				if (lineVals.length) {
					extent[0] = Math.min(extent[0], d3.min(lineVals));
					extent[1] = Math.max(extent[1], d3.max(lineVals));
				}
			}
			return extent;
		}
		const vals = dataSubset.map(d => +d.value).filter(v => !isNaN(v));
		const minVal = d3.min(vals);
		const maxVal = d3.max(vals);
		return [minVal >= 0 ? 0 : minVal, maxVal];
	}

	// Shared domain across all regular-chart data (used when freeYAxisScales is false)
	const allRegularData = regularEntries.flatMap(([, d]) => d);
	const sharedRegularDomain = calcYDomain(allRegularData);

	// ── Draw featured chart ─────────────────────────────────────────────────
	if (featuredEntry) {
		const [seriesName, data] = featuredEntry;

		const container = graphic.append('div')
			.attr('class', 'chart-container featured');

		if (featuredPosition === 'left') {
			container
				.style('grid-column', `span ${featuredColSpan}`)
				.style('grid-row', `span ${featuredRowSpan}`);
		} else {
			container.style('grid-column', '1 / -1');
		}

		const yDomain = featured.independentYAxis
			? calcYDomain(data)
			: calcYDomain(graphicData);

		drawColumnChart({
			container,
			seriesName,
			data,
			chartWidth: featuredChartWidth,
			height: featuredHeight,
			margin: { ...margin },
			yDomain,
			showYAxisLabel: true,
			showYAxisTicks: true,
			xDomain: globalXDomain,
			stackColumns,
			xAxisTicksEvery: featured.xAxisTicksEvery ? featured.xAxisTicksEvery[size] : null,
			titleClass: featured.titleStyle === 'heading' ? 'featured-title' : null
		});
	}

	// ── Group heading for the regular-chart section ────────────────────────
	if (config.groupHeading) {
		const heading = graphic.append('div')
			.attr('class', 'group-heading');

		// Span all regular-chart columns:
		// "left" layout: chartsPerRow cols (auto-placed after the featured div)
		// "top" / no featured: full row
		if (isFeatured && featuredPosition === 'left') {
			heading.style('grid-column', `span ${chartsPerRow}`);
		} else {
			heading.style('grid-column', '1 / -1');
		}

		heading.append('p')
			.style('margin-left', `${margin.left}px`)
			.text(config.groupHeading);
	}

	// ── Draw regular charts ─────────────────────────────────────────────────
	regularEntries.forEach(([seriesName, data], i) => {
		const isFirstInRow = (i % chartsPerRow) === 0;

		const chartMargin = { ...margin };
		if (config.dropYAxis && !config.freeYAxisScales && !isFirstInRow) {
			chartMargin.left = effectiveGap;
		}

		const yDomain = config.freeYAxisScales
			? calcYDomain(data)
			: sharedRegularDomain;

		const container = graphic.append('div')
			.attr('class', 'chart-container');

		drawColumnChart({
			container,
			seriesName,
			data,
			chartWidth: regularChartWidth,
			height: regularHeight,
			margin: chartMargin,
			yDomain,
			showYAxisLabel: isFirstInRow,
			showYAxisTicks: config.freeYAxisScales || isFirstInRow,
			xDomain: globalXDomain,
			stackColumns
		});
	});

	// ── Legend (stacked mode only) ───────────────────────────────────────────
	if (isStacked) {
		const legend = d3.select('#legend');
		legend.selectAll('*').remove();

		const legendData = stackColumns.map((col, i) => ({
			label: col,
			color: config.colourPalette[i % config.colourPalette.length]
		}));

		const items = legend.selectAll('div.legend--item')
			.data(legendData)
			.enter()
			.append('div')
			.attr('class', 'legend--item');

		items.append('svg')
			.attr('class', 'legend--icon--svg')
			.attr('width', 16)
			.attr('height', 16)
			.append('circle')
			.attr('r', 6).attr('cx', 8).attr('cy', 8)
			.attr('fill', d => d.color);

		items.append('div').append('p')
			.attr('class', 'legend--text')
			.text(d => d.label);

		// Line series legend entry
		if (config.showMarkers && config.lineSeries) {
			const lineLegendItem = legend.append('div').attr('class', 'legend--item line');
			const lineSvg = lineLegendItem.append('svg')
				.attr('class', 'legend--icon--svg')
				.attr('width', 24).attr('height', 18);

			if (config.showLine) {
				lineSvg.append('line')
					.attr('x1', 2).attr('x2', 21).attr('y1', 8).attr('y2', 8)
					.attr('class', 'dataLine')
					.attr('stroke', config.lineColour)
					.attr('stroke-width', '3px');
			}

			lineSvg.append('path')
				.attr('d', diamondShape(8))
				.attr('transform', 'translate(12, 8)')
				.attr('stroke', config.lineColour)
				.attr('class', 'diamondStyle');

			lineLegendItem.append('div').append('p')
				.attr('class', 'legend--text')
				.text(config.lineSeries);
		}
	}

	addSource('source', config.sourceText);
	if (pymChild) pymChild.sendHeight();
}

// ── Single-panel column chart ───────────────────────────────────────────────
function drawColumnChart({
	container,
	seriesName,
	data,
	chartWidth,
	height,
	margin,
	yDomain,
	showYAxisLabel,
	showYAxisTicks,
	xDomain,           // global date domain — keeps x axes consistent across panels
	stackColumns,      // array of column names to stack (empty/undefined = simple bars)
	xAxisTicksEvery,   // per-panel override; falls back to config.xAxisTicksEvery[size]
	titleClass         // optional extra CSS class added to the chart title text
}) {

	// Detect x data type from the first datum
	let xDataType;
	if (data[0].date instanceof Date) {
		xDataType = 'date';
	} else if (typeof data[0].date === 'number') {
		xDataType = 'numeric';
	} else {
		xDataType = 'string';
	}

	// ── Scales ──────────────────────────────────────────────────────────────
	const x = d3.scaleBand()
		.paddingOuter(0.05)
		.paddingInner(0.1)
		.range([0, chartWidth])
		.round(false);

	x.domain(xDomain || [...new Set(data.map(d => d.date))]);

	const y = d3.scaleLinear()
		.domain(yDomain)
		.nice()
		.range([height, 0]);

	// ── X-axis tick values ───────────────────────────────────────────────────
	const tickEvery = xAxisTicksEvery ?? config.xAxisTicksEvery[size];
	const allDates = x.domain();
	let tickValues = allDates.filter((d, i) => !(i % tickEvery));
	if (config.addFirstDate) tickValues = [...new Set([allDates[0], ...tickValues])];
	if (config.addFinalDate) tickValues = [...new Set([...tickValues, allDates[allDates.length - 1]])];

	const xTime = xDataType === 'date' ? d3.timeFormat(config.xAxisTickFormat[size]) : null;

	let xAxisGenerator;
	if (config.labelSpans && config.labelSpans.enabled && xDataType === 'date') {
		xAxisGenerator = customTemporalAxis(x)
			.timeUnit(config.labelSpans.timeUnit)
			.tickSize(0)
			.tickPadding(6)
			.secondaryTimeUnit(config.labelSpans.secondaryTimeUnit)
			.yearStartMonth(config.labelSpans.yearStartMonth || 0)
			.secondaryTickFormat(d => prefixYearFormatter(
				d,
				config.labelSpans.yearStartMonth || 0,
				config.labelSpans.prefix || ''
			));
	} else {
		xAxisGenerator = d3.axisBottom(x)
			.tickSize(10)
			.tickPadding(10)
			.tickValues(tickValues)
			.tickFormat(d =>
				xDataType === 'date' ? xTime(d)
					: xDataType === 'numeric' ? d3.format(config.xAxisNumberFormat)(d)
						: d
			);
	}

	// ── Y-axis generator ─────────────────────────────────────────────────────
	// Tick labels are hidden on non-first-in-row charts when dropYAxis is true,
	// but the gridlines (tickSize) still span the chart so the grid aligns.
	const yAxisGenerator = d3.axisLeft(y)
		.tickSize(-chartWidth)
		.tickPadding(10)
		.ticks(config.yAxisTicks[size])
		.tickFormat(d => showYAxisTicks ? d3.format(config.yAxisTickFormat)(d) : '');

	// ── SVG ──────────────────────────────────────────────────────────────────
	const svg = addSvg({
		svgParent: container,
		chartWidth,
		height: height + margin.top + margin.bottom,
		margin
	});

	// ── Y axis (gridlines + optional tick labels) — drawn first so bars sit on top
	svg.append('g')
		.attr('class', 'y axis numeric')
		.call(yAxisGenerator)
		.call(g => {
			g.selectAll('.tick line')
				.each(function(d) {
					if (d === 0) d3.select(this).attr('class', 'zero-line');
				});
			g.selectAll('.tick text').call(wrap, margin.left - 10);
		});

	// ── Bars ─────────────────────────────────────────────────────────────────
	if (config.stacked && stackColumns && stackColumns.length > 0) {

		// ── Stacked bars ──────────────────────────────────────────────────────
		const stack = d3.stack()
			.keys(stackColumns)
			.offset(d3[config.stackOffset || 'stackOffsetNone'])
			.order(d3[config.stackOrder || 'stackOrderNone']);

		const series = stack(data);

		svg.append('g')
			.selectAll('g')
			.data(series)
			.join('g')
			.attr('fill', (d, i) => config.colourPalette[i % config.colourPalette.length])
			.selectAll('rect')
			.data(d => d)
			.join('rect')
			.attr('y', d => Math.min(y(d[0]), y(d[1])))
			.attr('x', d => x(d.data.date))
			.attr('height', d => Math.abs(y(d[0]) - y(d[1])))
			.attr('width', x.bandwidth());

		// ── Optional line+marker overlay ─────────────────────────────────────
		if (config.showMarkers && config.lineSeries) {
			const lineData = data.map(d => ({ name: d.date, amt: d[config.lineSeries] }));

			const linePath = d3.line()
				.defined(d => d.amt != null && d.amt !== 'null')
				.x(d => x(d.name) + x.bandwidth() / 2)
				.y(d => y(d.amt));

			if (config.showLine) {
				svg.append('path')
					.datum(lineData)
					.attr('class', 'dataLine')
					.attr('stroke', config.lineColour || '#000')
					.attr('d', linePath);
			}

			svg.selectAll('.diamondStyle')
				.data(lineData.filter(d => d.amt != null))
				.join('path')
				.attr('d', diamondShape(8))
				.attr('transform', d => `translate(${x(d.name) + x.bandwidth() / 2}, ${y(d.amt)})`)
				.attr('stroke', config.lineColour || '#000')
				.attr('class', 'diamondStyle');
		}

	} else {

		// ── Simple (non-stacked) bars ─────────────────────────────────────────
		svg.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('y', d => y(Math.max(+d.value, 0)))
			.attr('x', d => x(d.date))
			.attr('height', d => Math.abs(y(+d.value) - y(0)))
			.attr('width', x.bandwidth())
			.attr('fill', config.colourPalette);

	}

	// ── X axis ───────────────────────────────────────────────────────────────
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxisGenerator);

	// ── Chart title (series name) ─────────────────────────────────────────────
	addChartTitleLabel({
		svgContainer: svg,
		yPosition: -margin.top / 1.5,
		text: seriesName,
		wrapWidth: chartWidth + margin.right
	});
	if (titleClass) svg.select('.title').classed(titleClass, true);

	// ── Y-axis label ──────────────────────────────────────────────────────────
	if (showYAxisLabel) {
		addAxisLabel({
			svgContainer: svg,
			xPosition: 5 - margin.left,
			yPosition: -10,
			text: config.yAxisLabel,
			textAnchor: 'start',
			wrapWidth: chartWidth
		});
	}
}

// ── Data loading ────────────────────────────────────────────────────────────
d3.csv(config.graphicDataURL).then((rawData) => {
	// Preserve original column order — used to determine stack key order
	rawColumns = rawData.columns;

	const parseTime = d3.utcParse(config.dateFormat);

	graphicData = rawData.map(d => {
		const date = parseTime(d.date) !== null
			? parseTime(d.date)
			: (isNaN(+d.date) ? d.date : +d.date);

		if (config.stacked) {
			// Wide format: date + [category columns...] + series
			// Convert every column except date and series to a number.
			const row = { date, series: d.series };
			rawColumns.forEach(k => {
				if (k !== 'date' && k !== 'series') {
					row[k] = d[k] === '' ? null : +d[k];
				}
			});
			return row;
		} else {
			// Narrow format: date, value, series
			return {
				date,
				value: d.value === '' ? null : +d.value,
				series: d.series
			};
		}
	});

	pymChild = new pym.Child({
		renderCallback: drawGraphic
	});
});
