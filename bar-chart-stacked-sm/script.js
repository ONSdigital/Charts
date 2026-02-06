import { initialise, wrap, addSvg, calculateChartWidth, addChartTitleLabel, addAxisLabel, addSource, addAnnotationRangeHorizontal } from "../lib/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphicData, size;

function drawGraphic() {
    //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
    size = initialise(size);

    const aspectRatio = config.aspectRatio[size];
    const chartsPerRow = config.chartEvery[size];

    // Get categories from the keys used in the stack generator
    const categories = Object.keys(graphicData[0]).filter((k) => k !== 'name' && k !== 'date' && k !== 'series' && k !== 'group');

    // Nest the graphicData by the 'group' column
    let nestedData = d3.group(graphicData, (d) => d.group);

    // Create a container div for each small multiple
    let chartContainers = graphic
        .selectAll('.chart-container')
        .data(Array.from(nestedData))
        .join('div')
        .attr('class', 'chart-container');

    function drawChart(container, data, seriesName, chartIndex) {
        let chartPosition = chartIndex % chartsPerRow;
        let margin = { ...config.margin[size] };
        let chartGap = config?.chartGap || 10;
        let chartWidth = calculateChartWidth({
            screenWidth: parseInt(graphic.style('width')),
            chartEvery: chartsPerRow,
            chartMargin: margin,
            chartGap: chartGap
        });

        if (config.dropYAxis) {
            if (chartPosition !== 0) {
                margin.left = chartGap;
            }
        }

        let height = aspectRatio[1] / aspectRatio[0] * chartWidth;

        // Flip axes: x is value, y is category
        const x = d3.scaleLinear().range([0, chartWidth]);
        const y = d3.scaleBand().paddingOuter(0.0).paddingInner(0.1).range([0, height]).round(true);

        y.domain([...new Set(graphicData.map((d) => d.name))]);

        const stack = d3.stack()
            .keys(categories)
            .offset(d3[config.stackOffset])
            .order(d3[config.stackOrder]);

        const series = stack(data);
        const seriesAll = stack(graphicData);

        if (config.yDomain == 'auto') {
            x.domain(d3.extent(seriesAll.flat(2)));
        } else {
            x.domain(config.yDomain);
        }

        // Create an SVG element
        const svg = addSvg({
            svgParent: container,
            chartWidth: chartWidth,
            height: height + margin.top + margin.bottom,
            margin: margin
        });

        // Draw bars
        svg.append('g')
            .selectAll('g')
            .data(series)
            .join('g')
            .attr('fill', (d, i) => config.colourPalette[i])
            .selectAll('rect')
            .data((d) => d)
            .join('rect')
            .attr('x', (d) => x(d[0]))
            .attr('y', (d) => y(d.data.name))
            .attr('width', (d) => Math.abs(x(d[1]) - x(d[0])))
            .attr('height', y.bandwidth());

        const xAxisTickFormat = config.xAxisTickFormat[size];
        const isDateScale = x.tickFormat && typeof x.domain()[0] !== 'number';

        // Add grid lines to x axis
        const gridG = svg.append('g')
            .attr('class', 'grid')
            .call(
                d3.axisBottom(x)
                .ticks(config.xAxisTicks[size])
                .tickSize(-height)
                .tickFormat('')

            )
            .attr('transform', `translate(0,${height})`)
            .lower();

        // Ensure grid tick lines have zero-line class for correct styling
        gridG.selectAll('.tick line')
            .attr('class', function(d) {
                return d === 0 ? 'zero-line' : null;
            });

        // Add the x-axis
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .ticks(config.xAxisTicks[size])
                .tickFormat(isDateScale ? d3.timeFormat(xAxisTickFormat) : d3.format(xAxisTickFormat))
            );

        // Ensure tick lines and zero line use correct CSS classes for x axis
        svg.selectAll('g.x.axis .tick line')
            .attr('class', function(d) {
                return d === 0 ? 'zero-line' : null;
            });

        // Only draw the y axis tick labels on the first chart in each row, or always if chartsPerRow is 1 or dropYAxis is false
        if (!config.dropYAxis || chartsPerRow === 1 || chartIndex % chartsPerRow === 0) {
            svg.append('g')
                .attr('class', 'y axis category')
                .call(d3.axisLeft(y).tickValues(y.domain()))
                .selectAll('.tick text')
                .call(wrap, margin.left - 10);
        } else {
            svg.append('g').attr('class', 'y axis category').call(d3.axisLeft(y).tickValues([]));
        }

        // Ensure tick lines and zero line use correct CSS classes for y axis
        svg.selectAll('g.y.axis.category .tick line')
            .attr('class', function(d) {
                return d === 0 ? 'zero-line' : null;
            });

        // This does the chart title label
        addChartTitleLabel({
            svgContainer: svg,
            yPosition: -margin.top / 2,
            text: seriesName,
            wrapWidth: (chartWidth + margin.right)
        });

        // This does the y-axis label
        if (chartIndex % chartsPerRow === 0) {
            addAxisLabel({
                svgContainer: svg,
                xPosition: 5 - margin.left,
                yPosition: 0,
                text: config.yAxisLabel,
                textAnchor: "start",
                wrapWidth: chartWidth
            });
        }

        // This does the x-axis label
        if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...chartContainers].length - 1) {
            addAxisLabel({
                svgContainer: svg,
                xPosition: chartWidth,
                yPosition: height + 35,
                text: config.xAxisLabel,
                textAnchor: "end",
                wrapWidth: chartWidth
            });
        }
    }

    // Draw the charts for each small multiple
    chartContainers.each(function ([key, value], i) {
        drawChart(d3.select(this), value, key, i);
    });

    // Set up the legend
    let legenditem = legend
        .selectAll('div.legend--item')
        .data(categories.map((cat, i) => [cat, config.colourPalette[i]]))
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

    // Set legend columns if config.legendColumns is defined
    if (config.legendColumns) {
        legend.style('display', 'grid')
              .style('grid-template-columns', `repeat(${config.legendColumns}, 1fr)`);
    }

    //create source text
    addSource('source', config.sourceText);

    //use pym to calculate chart dimensions
    if (pymChild) {
        pymChild.sendHeight();
    }
}

// Load the data

d3.csv(config.graphicDataURL).then((data) => {
    graphicData = data;

    pymChild = new pym.Child({
        renderCallback: drawGraphic
    });
});