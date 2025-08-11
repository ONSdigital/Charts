import { initialise, wrap, addSvg, calculateChartWidth, addDataLabelsVertical, addChartTitleLabel, addAxisLabel } from "https://cdn.ons.gov.uk/assets/data-vis-charts/v1/helpers.js";

let graphic = d3.select('#graphic');
let legend = d3.select('#legend');
let pymChild = null;
let graphic_data, size, svg;

function drawGraphic() {

    //Set up some of the basics and return the size value ('sm', 'md' or 'lg')
    size = initialise(size);

    let legendCategories = [...new Set(graphic_data.map((d) => d.category))]

    //Set up the legend
    let legendItem = legend
        .selectAll('div')
        .data(legendCategories)
        .join('div')
        .attr('class', 'legend--item')

    legendItem
        .append('div')
        .attr('class', 'legend--icon--circle')
        .style('background-color', (d, i) => config.essential.colour_palette[i])

    legendItem
        .append('div')
        .append('p')
        .attr('class', 'legend--text')
        .text(d => d)

    // Nest the graphic_data by the 'series' column
    let nested_data = d3.group(graphic_data, (d) => d.series);

    //Generate a list of categories based on the order in the first chart that we can use to order the subsequent charts
    let namesArray = [...new Set([...nested_data][0][1].map(d => d.name))];
    // console.log(namesArray)

    // Create a container div for each small multiple
    let chartContainers = graphic
        .selectAll('.chart-container')
        .data(Array.from(nested_data))
        .join('div')
        .attr('class', 'chart-container');

    function drawChart(container, data, chartIndex) {

        // console.log(chartIndex);

        //Sort the data so that the bars in each chart are in the same order
        data.sort((a, b) => namesArray.indexOf(a.name) - namesArray.indexOf(b.name))

        // Log the data being used for each small multiple
        // console.log('Data for this small multiple:', data);

        // Calculate the y-axis domain for the current chart
        let yDomain = [
            Math.min(0, d3.min(data.map(({ value }) => Number(value)))),
            Math.max(0, d3.max(data.map(({ value }) => Number(value))))
        ];

        // Calculate the height based on the y-axis domain
        let height = config.essential.chartHeight[size] - config.optional.margin[size].top - config.optional.margin[size].bottom;

        let chartsPerRow = config.optional.chart_every[size];
        let chartPosition = chartIndex % chartsPerRow;

        let margin = { ...config.optional.margin[size] };
        let chartGap = config.optional?.chartGap || 10;

        let chart_width = calculateChartWidth({
            screenWidth: parseInt(graphic.style('width')),
            chartEvery: chartsPerRow,
            chartMargin: margin,
            chartGap: chartGap
        })

        // If the chart is not in the first position in the row, reduce the left margin
        if (config.optional.dropYAxis) {
            if (chartPosition !== 0) {
                margin.left = chartGap;
            }
        }

        // Set up scales
        const y = d3.scaleLinear().range([height, 0]).domain(yDomain);

        const x = d3
            .scaleBand()
            .paddingOuter(0.1)
            .paddingInner(0.2)
            .range([0, chart_width])
            .round(true);

        // Use the data to find unique entries in the name column
        x.domain([...new Set(data.map((d) => d.name))]);

        const x2 = d3
            .scaleBand()
            .paddingOuter(0)
            .paddingInner(0)
            .range([0, x.bandwidth()])
            .round(true);

        // Use the data to find unique entries in the category column
        x2.domain(legendCategories);

        // Set up xAxis generator
        let xAxis = d3.axisBottom(x)
            .tickSize(0)
            .tickPadding(10)
            .tickFormat((d) => config.optional.dropYAxis !== true ? (d) :
                chartPosition == 0 ? (d) : "");

        // Set up yAxis generator
        let yAxis = d3
            .axisLeft(y)
            .tickSize(-chart_width)
            .tickFormat(d3.format(config.essential.dataLabels.numberFormat))
            .ticks(config.optional.xAxisTicks[size]);

        // Create svg for chart
        svg = addSvg({
            svgParent: container,
            chart_width: chart_width,
            height: height + margin.top + margin.bottom,
            margin: margin
        })

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

        svg.selectAll('.x.axis')
            .selectAll('text')
            .call(wrap, x.bandwidth());

        svg
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .selectAll('text')
            .call(wrap, margin.left - 10);

        svg
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', (d) => x(d.name) + x2(d.category))
            .attr('y', d => y(Math.max(0, d.value)))
            .attr('width', x2.bandwidth())
            .attr('height', (d) => Math.abs(y(d.value) - y(0)))
            .attr('fill', (d) => config.essential.colour_palette[legendCategories.indexOf(d.category)]);

        if (config.essential.dataLabels.show == true && legendCategories.length <= 2) {
			addDataLabelsVertical({
				svgContainer: svg,
				data: data,
				xScaleFunction: x,
				yScaleFunction: y,
				y2function: x2,
			})
        } //end if for datalabels

        // This does the chart title label
        addChartTitleLabel({
            svgContainer: svg,
            yPosition: -15,
            xPosition: - margin.left +5,
            text: d => d[0],
            wrapWidth: chart_width
        })

        // This does the x-axis label
        if (chartIndex % chartsPerRow === chartsPerRow - 1 || chartIndex === [...nested_data].length - 1) {
            addAxisLabel({
                svgContainer: svg,
                xPosition: chart_width,
                yPosition: height + 35,
                text: config.essential.xAxisLabel,
                textAnchor: "end",
                wrapWidth: chart_width
            });
        }
    }

    // Draw the charts for each small multiple
    chartContainers.each(function ([key, value], i) {
        drawChart(d3.select(this), value, i);
    });

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