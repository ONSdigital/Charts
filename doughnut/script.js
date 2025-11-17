import { initialise, wrap, addSource } from "../lib/helpers.js";

var graphic = d3.select('#graphic');
var legend = d3.select('#legend');
var pymChild = null;
let graphicData, size, svg;

function drawGraphic() {

	//Set up some of the basics and return the size value ('sm', 'md' or 'lg')
	size = initialise(size);

    var margin = config.margin[size];
    var chartWidth =
        parseInt(graphic.style('width')) - margin.left - margin.right;
    //height is set by unique options in column name * a fixed height + some magic because scale band is all about proportion
    var height = config.chartHeight[size];

    const radius = Math.min(chartWidth, height) / 2
    const outerRadius = radius * 1.1

    const arc = d3.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius)

    const labelArc = d3.arc()
        .innerRadius(outerRadius)
        .outerRadius(outerRadius)

    const lineArc = d3.arc()
        .innerRadius(radius + 5)
        .outerRadius(radius + 5)

    const pie = d3.pie()
        .padAngle(3 / height) //The white space between the sections of the doughnut - expressed in radians
        .value(d => d.value)


    //create svg for chart
    svg = d3
        .select('#graphic')
        .append('svg')
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart')
        .append('g')
        .attr('transform', 'translate(' + 0 + ',' + (margin.top) + ')');


    //Drawing the pie
    svg.append('g')
        .attr('transform', 'translate(' + (margin.left + chartWidth / 2) + ',' + (margin.top + height / 2) + ')')
        .selectAll()
        .data(pie(graphicData))
        .join('path')
        .attr('class', (d, i) => 'path' + i)
        .attr('fill', (d, i) => config.colourPalette[i])
        .attr('d', arc)

    if (config.dataLabels.show && size !== "sm") {

        //Adding layers for lines and labels
        let labels = svg.append("g")
            .attr('transform', 'translate(' + (margin.left + chartWidth / 2) + ',' + (margin.top + height / 2) + ')')
            .attr("class", "dataLabels")

        //Adding text for category and values
        labels
            .selectAll('text')
            .data(pie(graphicData))
            .join('text')
            .attr('transform', d => {
                var pos = labelArc.centroid(d);
                pos[0] = radius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
                return `translate(${pos})`
            })
            .text(d => d.data.category)
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => midAngle(d) < Math.PI ? "start" : "end")
            .attr('fill', '#414042')
            .style('font-weight', 600)
            .attr('class', (d, i) => "label" + i)
            .call(wrap, (parseInt(graphic.style('width')) - (2 * radius)) / 2)

        labels
            .selectAll('text')
            .data(pie(graphicData))
            .join('text')
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '1.1em')
            .attr('font-weight', 400)
            .text(d => d3.format(config.dataLabels.numberFormat)(d.value))

        //Adding connecting lines
        svg.append("g")
            .attr('transform', 'translate(' + (margin.left + chartWidth / 2) + ',' + (margin.top + height / 2) + ')')
            .attr("class", "lines")
            .selectAll('polyline')
            .data(pie(graphicData))
            .join('polyline')
            .attr('points', d => {
                var pos = labelArc.centroid(d);
                pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                var second = labelArc.centroid(d);
                second[0] = lineArc.centroid(d)[0] + (labelArc.centroid(d)[1] - lineArc.centroid(d)[1])
                return [lineArc.centroid(d), second, pos]
            })
            .attr('stroke', '#b3b3b3')
            .attr('stroke-width', '1px')
            .attr('fill', 'none')
            .attr('class', (d, i) => "polyline" + i)

        //Use this function to manually shift labels by small distances - labels are numbered (called "index" here) clockwise from the top
        function moveLabel(index, yDistance) {

            //Manually shifting this polyline
            d3.select('.polyline' + index)
                .attr('points', d => {
                    var second = labelArc.centroid(d);
                    second[0] = lineArc.centroid(d)[0] - Math.abs(yDistance) - (lineArc.centroid(d)[1] - labelArc.centroid(d)[1]);
                    second[1] = second[1] + yDistance;
                    var last = labelArc.centroid(d);
                    last[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    last[1] = last[1] + yDistance;
                    return [lineArc.centroid(d), second, last]
                })

            //Manually shifting this label
            d3.select('.label' + index)
                .attr('transform', d => {
                    var pos = labelArc.centroid(d);
                    pos[0] = radius * 1 * (midAngle(d) < Math.PI ? 1 : -1);
                    pos[1] = pos[1] + yDistance;
                    return `translate(${pos})`
                })

        }

        //e.g. To move the third label up 10px
        moveLabel(2, -10)


        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

    } else {

        // Set up the legend
        var legenditemPie = d3.select('#legend')
            .selectAll('div.legend--item')
            .data(d3.zip(graphicData.map(item => (item.category)),
                graphicData.map(item => d3.format(config.dataLabels.numberFormat)(item.value)),
                config.colourPalette))
            .enter()
            .append('div')
            .attr('class', 'container'); // Add float-right class here

        var leftContainer = legenditemPie.append('div').attr('class', 'leftContainer'); // Add a div to contain left1 and left2

        leftContainer.append('div').attr('class', 'left1') // Add class left1
            .append('svg') // Append an SVG element
            .attr('width', 18) // Set the width of the SVG
            .attr('height', 15) // Set the height of the SVG
            .append('circle') // Append a circle element
            .attr('cx', 8) // Set the x-coordinate of the circle's center
            .attr('cy', 9) // Set the y-coordinate of the circle's center
            .attr('r', 6)
            .attr('fill', d => d[2]); // Set the fill color of the circle

        leftContainer.append('div').attr('class', 'left2') // Add class left2
            .append('p').html(d => d[0]);

        legenditemPie.append('div').attr('class', 'right')
            .append('p').html(d => d[1]);
    };


    // This does the centre label
    svg
        .append('g')
        .attr('transform', 'translate(' + (margin.left + chartWidth / 2) + ',' + (margin.top + height / 2) + ')')
        .append('text')
        .attr('fill', '#414042')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-weight', 600)
        .text(config.centreLabel)
        .attr('text-anchor', 'middle')
        .call(wrap, radius / 2);


    //create link to source
    addSource('source', config.sourceText);

    //use pym to calculate chart dimensions
    if (pymChild) {
        pymChild.sendHeight();
    }
}

d3.csv(config.graphicDataURL).then((data) => {
    //load chart data
    graphicData = data.sort(function (a, b) {
        return b.value - a.value //  Sorting the categories by value, may prefer to sort alphabetically (a.category - b.category) or not at all
    });

    //use pym to create iframed chart dependent on specified variables
    pymChild = new pym.Child({
        renderCallback: drawGraphic
    });
});