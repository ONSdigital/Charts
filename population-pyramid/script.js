import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js"

const graphic = d3.select('#graphic');
const titles = d3.select('#titles');
const legend = d3.select('#legend');
let pymChild = null;

// Data variables
let graphic_data, comparisonData, time_comparisonData, dropdownData;
let size, allAges, tidydata, rolledUp, tidydataPercentage;
let popTotal, comparisonPopTotal, timeComparisonPopTotal;
let graphic_data_new, comparisonData_new, time_comparisonData_new;
let tidydatacomparison, rolledUpComparison, tidydataComparisonPercentage;

// Chart variables
let maxPercentage, width, chart_width, height;
let xLeft, xRight, y, svg, lineLeft, lineRight, comparisons;
let widths, dataForLegend, titleDivs;

function drawGraphic() {
    // Clear existing graphics
    titles.selectAll('*').remove();
    legend.selectAll('*').remove();

    if (config.interactionType === 'toggle') {
        d3.select('#nav').selectAll('*').remove();
    }
    if (config.interactionType === 'dropdown') {
        d3.select('#select').selectAll('*').remove();
    }

    // Build interaction controls based on config
    if (config.interactionType === 'toggle') {
        buildToggleControls();
    } else if (config.interactionType === 'dropdown') {
        buildDropdownControls();
    }

    // Set up basics
    size = initialise(size);

    let margin = config.margin[size];
    margin.centre = config.margin.centre;
    // Process data based on structure type
    processData();

    // Create chart
    createChart(margin);

    // Create source link
    addSource('source', config.sourceText)

    // Use pym to calculate chart dimensions
    if (pymChild) {
        pymChild.sendHeight();
    }
}

function buildToggleControls() {
    let fieldset = d3.select('#nav').append('fieldset');

    fieldset
        .append('legend')
        .attr('class', 'visuallyhidden')
        .html('Choose a variable');

    fieldset
        .append('div')
        .attr('class', 'visuallyhidden')
        .attr('aria-live', 'polite')
        .append('span')
        .attr('id', 'selected');

    let grid = fieldset.append('div').attr('class', 'grid');

    let cell = grid
        .selectAll('div.grid-cell')
        .data(config.buttonLabels)
        .join('div')
        .attr('class', 'grid-cell');

    cell
        .append('input')
        .attr('type', 'radio')
        .attr('class', 'visuallyhidden')
        .attr('id', (d, i) => 'button' + i)
        .attr('value', (d, i) => i)
        .attr('name', 'button');

    cell
        .append('label')
        .attr('for', (d, i) => 'button' + i)
        .append('div')
        .html(d => d);

    // Set first button to selected
    d3.select('#button0').property('checked', true);
    d3.select('#selected').text(
        config.buttonLabels[0] + ' is selected'
    );

    // Button interactivity
    d3.selectAll('input[type="radio"]').on('change', function () {
        const selectedValue = document.querySelector('input[name="button"]:checked').value;
        onToggleChange(selectedValue);
        d3.select('#selected').text(
            config.buttonLabels[selectedValue] + ' is selected'
        );
    });
}

function buildDropdownControls() {
    // Build dropdown with unique areas
    dropdownData = graphic_data
        .map(d => ({ nm: d.AREANM, cd: d.AREACD }))
        .filter(function (a) {
            let key = a.nm + '|' + a.cd;
            if (!this[key]) {
                this[key] = true;
                return true;
            }
        }, Object.create(null))
        .sort((a, b) => d3.ascending(a.nm, b.nm));

    const select = new EnhancedSelect({
        containerId: 'select',
        options: dropdownData,
        label: 'Select an area',
        placeholder: "Select an area",
        mode: 'default',
        idKey: 'cd',
        labelKey: 'nm',
        // groupKey:'group',
        onChange: (selectedValue) => {
            if (selectedValue) {
                changeDataFromDropdown(selectedValue.cd)
            } else {
                clearChart()
            }
        }
    });
}

function processData() {
    if (config.dataStructure === 'simple') {
        // Process simple bar data structure
        processSimpleData();
    } else if (config.dataStructure === 'complex') {
        // Process complex pivot data structure
        processComplexData();
    }
}

function processSimpleData() {
    if (config.dataType === 'counts') {
        // Calculate totals and percentages
        popTotal = d3.sum(graphic_data, d => d.maleBar + d.femaleBar);

        if (comparisonData) {
            comparisonPopTotal = d3.sum(comparisonData, d => d.maleBar + d.femaleBar);
        }

        if (time_comparisonData) {
            timeComparisonPopTotal = d3.sum(time_comparisonData, d => d.maleBar + d.femaleBar);
        }

        // Transform to tidy data - use raw counts or percentages based on displayType
        const usePercentages = config.displayType !== 'counts';

        graphic_data_new = graphic_data
            .map(d => [
                { age: d.age, sex: 'female', value: usePercentages ? d.femaleBar / popTotal : d.femaleBar },
                { age: d.age, sex: 'male', value: usePercentages ? d.maleBar / popTotal : d.maleBar }
            ])
            .flatMap(d => d);

        if (comparisonData) {
            comparisonData_new = comparisonData.map(d => ({
                age: d.age,
                malePercent: usePercentages ? d.maleBar / comparisonPopTotal : d.maleBar,
                femalePercent: usePercentages ? d.femaleBar / comparisonPopTotal : d.femaleBar
            }));
        }

        if (time_comparisonData) {
            time_comparisonData_new = time_comparisonData.map(d => ({
                age: d.age,
                malePercent: usePercentages ? d.maleBar / timeComparisonPopTotal : d.maleBar,
                femalePercent: usePercentages ? d.femaleBar / timeComparisonPopTotal : d.femaleBar
            }));
        }
    } else {
        // Data is already in percentages
        graphic_data_new = graphic_data
            .map(d => [
                { age: d.age, value: d.femaleBar, sex: 'female' },
                { age: d.age, sex: 'male', value: d.maleBar }
            ])
            .flatMap(d => d);

        if (comparisonData) {
            comparisonData_new = comparisonData.map(d => ({
                age: d.age,
                malePercent: d.maleBar,
                femalePercent: d.femaleBar
            }));
        }

        if (time_comparisonData) {
            time_comparisonData_new = time_comparisonData.map(d => ({
                age: d.age,
                malePercent: d.maleBar,
                femalePercent: d.femaleBar
            }));
        }
    }

    // Calculate max percentage for scales based on xDomain setting
    if (config.xDomain === 'auto') {
        let maxValues = [d3.max(graphic_data_new, d => d.value)];
        if (comparisonData_new) {
            maxValues.push(d3.max(comparisonData_new, d => Math.max(d.femalePercent, d.malePercent)));
        }
        if (time_comparisonData_new) {
            maxValues.push(d3.max(time_comparisonData_new, d => Math.max(d.femalePercent, d.malePercent)));
        }
        maxPercentage = d3.max(maxValues);
    } else if (Array.isArray(config.xDomain)) {
        maxPercentage = config.xDomain[1];
    } else if (config.xDomain === 'auto-each') {
        maxPercentage = d3.max(graphic_data_new, d => d.value);
    }
}

function processComplexData() {
    allAges = graphic_data.columns.slice(3);

    if (config.dataType === 'counts') {
        // Turn into tidy data
        tidydata = pivot(graphic_data, allAges, 'age', 'value');

        // Calculate totals by area
        rolledUp = d3.rollup(
            tidydata,
            v => d3.sum(v, d => d.value),
            d => d.AREACD
        );

        // Calculate percentages or use raw counts based on displayType
        const usePercentages = config.displayType !== 'counts';

        tidydataPercentage = tidydata.map(d => ({
            ...d,
            percentage: usePercentages ? d.value / rolledUp.get(d.AREACD) : d.value
        }));

        // Process comparison data if it exists
        if (comparisonData && config.hasInteractiveComparison) {
            tidydatacomparison = pivot(comparisonData, allAges, 'age', 'value');
            rolledUpComparison = d3.rollup(
                tidydatacomparison,
                v => d3.sum(v, d => d.value),
                d => d.AREACD
            );
            tidydataComparisonPercentage = tidydatacomparison.map(d => ({
                ...d,
                percentage: usePercentages ? d.value / rolledUpComparison.get(d.AREACD) : d.value
            }));
        } else if (comparisonData) {
            // Simple comparison data structure
            const comparisonTotal = d3.sum(comparisonData, d => d.maleBar + d.femaleBar);
            comparisonData_new = comparisonData.map(d => ({
                age: d.age,
                male: usePercentages ? d.maleBar / comparisonTotal : d.maleBar,
                female: usePercentages ? d.femaleBar / comparisonTotal : d.femaleBar
            }));
        }
    } else {
        // Data already in percentages
        tidydataPercentage = pivot(graphic_data, allAges, 'age', 'percentage');

        if (comparisonData && config.hasInteractiveComparison) {
            tidydataComparisonPercentage = pivot(comparisonData, allAges, 'age', 'percentage');
        } else if (comparisonData) {
            comparisonData_new = comparisonData.map(d => ({
                age: d.age,
                male: d.maleBar,
                female: d.femaleBar
            }));
        }
    }

    // Calculate max percentage based on xDomain setting
    if (config.xDomain === 'auto') {
        let maxValues = [d3.max(tidydataPercentage, d => d.percentage)];
        if (tidydataComparisonPercentage) {
            maxValues.push(d3.max(tidydataComparisonPercentage, d => d.percentage));
        } else if (comparisonData_new) {
            maxValues.push(d3.max(comparisonData_new, d => Math.max(d.female, d.male)));
        }
        maxPercentage = d3.max(maxValues);
    } else if (Array.isArray(config.xDomain)) {
        maxPercentage = config.xDomain[1];
    } else if (config.xDomain === 'auto-each') {
        maxPercentage = d3.max(tidydataPercentage, d => d.percentage);
    }
}

function createChart(margin) {
    console.log(margin)
    // Set up dimensions
    width = parseInt(graphic.style('width'));
    chart_width = (width - margin.centre - margin.left - margin.right) / 2;

    if (config.dataStructure === 'simple') {
        height = (graphic_data_new.length / 2) * config.seriesHeight[size];
    } else {
        height = allAges.length * config.seriesHeight[size];
    }

    // Set up scales
    xLeft = d3.scaleLinear()
        .domain([0, maxPercentage])
        .rangeRound([chart_width, 0]);

    xRight = d3.scaleLinear()
        .domain(xLeft.domain())
        .rangeRound([chart_width + margin.centre, chart_width * 2 + margin.centre]);

    if (config.dataStructure === 'simple') {
        y = d3.scaleBand()
            .domain([...new Set(graphic_data_new.map(d => d.age))])
            .rangeRound([height, 0])
            .paddingInner(0.1);
    } else {
        y = d3.scaleBand()
            .domain(allAges)
            .rangeRound([height, 0])
            .paddingInner(0.1);
    }

    // Create SVG
    svg = addSvg({
        svgParent: graphic,
        chart_width: width,
        height: height + margin.top + margin.bottom,
        margin: margin
    });

    // Create line generators for comparison lines
    if (config.hasComparison) {
        if (config.dataStructure === 'simple') {
            lineLeft = d3.line()
                .curve(d3.curveStepBefore)
                .x(d => xLeft(d.femalePercent))
                .y(d => y(d.age) + y.bandwidth());

            lineRight = d3.line()
                .curve(d3.curveStepBefore)
                .x(d => xRight(d.malePercent))
                .y(d => y(d.age) + y.bandwidth());
        } else if (config.hasInteractiveComparison) {
            lineLeft = d3.line()
                .curve(d3.curveStepBefore)
                .x(d => xLeft(d.percentage))
                .y(d => y(d.age) + y.bandwidth());

            lineRight = d3.line()
                .curve(d3.curveStepBefore)
                .x(d => xRight(d.percentage))
                .y(d => y(d.age) + y.bandwidth());
        } else {
            lineLeft = d3.line()
                .curve(d3.curveStepBefore)
                .x(d => xLeft(d.female))
                .y(d => y(d.age) + y.bandwidth());

            lineRight = d3.line()
                .curve(d3.curveStepBefore)
                .x(d => xRight(d.male))
                .y(d => y(d.age) + y.bandwidth());
        }
    }

    // Add axes
    addAxes(margin);

    // Add bars
    addBars();

    // Add comparison lines
    if (config.hasComparison) {
        addComparisonLines();
    }

    // Add axis labels
    addAxisLabels(margin);

    // Add legend
    addLegend(margin);
}

function addAxes(margin) {
    // Left x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(
            d3.axisBottom(xLeft)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height)
        )
        .selectAll('line')
        .each(function (d) {
            if (d === 0) {
                d3.select(this).attr('class', 'zero-line');
            }
        });

    // Right x-axis
    svg.append('g')
        .attr('class', 'x axis right')
        .attr('transform', `translate(0,${height})`)
        .call(
            d3.axisBottom(xRight)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height)
        )
        .selectAll('line')
        .each(function (d) {
            if (d === 0) {
                d3.select(this).attr('class', 'zero-line');
            }
        });

    // Y-axis
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${chart_width + margin.centre / 2 - 3},0)`)
        .call(
            d3.axisRight(y)
                .tickSize(0)
                .tickValues(y.domain().filter((d, i) => !(i % config.yAxisTicksEvery)))
        )
        .selectAll('text')
        .each(function () {
            d3.select(this).attr('text-anchor', 'middle');
        });
}

function addBars() {
    let barData;
    if (config.dataStructure === 'simple') {
        barData = graphic_data_new;
    } else if (config.interactionType === 'dropdown') {
        barData = tidydataPercentage.filter(d => d.AREACD === graphic_data[0].AREACD);
    } else {
        barData = tidydataPercentage;
    }

    const bars = svg.append('g')
        .attr('id', 'bars')
        .selectAll('rect')
        .data(barData)
        .join('rect')
        .attr('fill', d =>
            d.sex === 'female' ?
                config.colourPalette[0] :
                config.colourPalette[1]
        )
        .attr('y', d => y(d.age))
        .attr('height', y.bandwidth());

    if (config.interactionType === 'dropdown') {
        bars.attr('x', d => d.sex === 'female' ? xLeft(0) : xRight(0))
            .attr('width', 0);
    } else {
        const valueField = config.dataStructure === 'simple' ? 'value' : 'percentage';
        bars.attr('x', d => d.sex === 'female' ? xLeft(d[valueField]) : xRight(0))
            .attr('width', d =>
                d.sex === 'female' ?
                    xLeft(0) - xLeft(d[valueField]) :
                    xRight(d[valueField]) - xRight(0)
            );
    }
}

function addComparisonLines() {
    comparisons = svg.append('g');

    if (config.dataStructure === 'simple') {
        comparisons.append('path')
            .attr('class', 'line')
            .attr('id', 'comparisonLineLeft')
            .attr('d', lineLeft(comparisonData_new) + 'l 0 ' + -y.bandwidth())
            .attr('stroke', config.comparisonColourPalette[0])
            .attr('stroke-width', '2px');

        comparisons.append('path')
            .attr('class', 'line')
            .attr('id', 'comparisonLineRight')
            .attr('d', lineRight(comparisonData_new) + 'l 0 ' + -y.bandwidth())
            .attr('stroke', config.comparisonColourPalette[1])
            .attr('stroke-width', '2px');
    } else if (config.interactionType === 'dropdown') {
        comparisons.append('path')
            .attr('class', 'line')
            .attr('id', 'comparisonLineLeft')
            .attr('stroke', config.comparisonColourPalette[0])
            .attr('stroke-width', '2px')
            .attr('opacity', config.hasInteractiveComparison ? 0 : 1);

        comparisons.append('path')
            .attr('class', 'line')
            .attr('id', 'comparisonLineRight')
            .attr('stroke', config.comparisonColourPalette[1])
            .attr('stroke-width', '2px')
            .attr('opacity', config.hasInteractiveComparison ? 0 : 1);

        if (!config.hasInteractiveComparison) {
            d3.select('#comparisonLineLeft')
                .attr('d', lineLeft(comparisonData_new) + 'l 0 ' + -y.bandwidth());
            d3.select('#comparisonLineRight')
                .attr('d', lineRight(comparisonData_new) + 'l 0 ' + -y.bandwidth());
        }
    }
}

function addAxisLabels(margin) {
    addAxisLabel({
        svgContainer: svg,
        xPosition: width - margin.left,
        yPosition: height + 30,
        text: config.xAxisLabel,
        textAnchor: "end",
        wrapWidth: width
    });

    addAxisLabel({
        svgContainer: svg,
        xPosition: chart_width + margin.centre / 2,
        yPosition: -15,
        text: config.yAxisLabel,
        textAnchor: "middle",
        wrapWidth: width
    });
}

function addLegend(margin) {
    widths = [chart_width + margin.left, chart_width + margin.right];

    legend.append('div')
        .attr('class', 'flex-row')
        .style('gap', margin.centre + 'px')
        .selectAll('div')
        .data(['Females', 'Males'])
        .join('div')
        .style('width', (d, i) => widths[i] + 'px')
        .append('div')
        .attr('class', 'chartLabel')
        .append('p')
        .text(d => d);

    if (config.hasComparison) {
        dataForLegend = [['x', 'x'], ['y', 'y']];

        titleDivs = titles.selectAll('div')
            .data(dataForLegend)
            .join('div')
            .attr('class', 'flex-row')
            .style('gap', margin.centre + 'px')
            .selectAll('div')
            .data(d => d)
            .join('div')
            .style('width', (d, i) => widths[i] + 'px')
            .append('div')
            .attr('class', 'legend--item');

        titleDivs.append('div')
            .style('background-color', (d, i) =>
                d === 'x' ?
                    config.colourPalette[i] :
                    config.comparisonColourPalette[i]
            )
            .attr('class', d =>
                d === 'x' ? 'legend--icon--circle' : 'legend--icon--refline'
            );

        const legendTextClass = config.interactionType === 'toggle' ?
            (d) => 'legend--text ' + 'item' + d : 'legend--text';

        titleDivs.append('div')
            .append('p')
            .attr('class', legendTextClass)
            .html(d => {
                if (d === 'x') {
                    return config.legend[0];
                } else if (config.interactionType === 'toggle') {
                    return config.buttonLabels[0];
                } else {
                    return config.legend[1];
                }
            });
    }
}

function changeDataFromDropdown(areacd) {

    const selectedData = tidydataPercentage.filter(d => d.AREACD === areacd);

    // Add this block for auto-each scaling
    if (config.xDomain === 'auto-each') {
        const newMaxPercentage = d3.max(selectedData, d => d.percentage);
        
        xLeft.domain([0, newMaxPercentage]);
        xRight.domain([0, newMaxPercentage]);
        
        // Update axes with transition
        svg.select('.x.axis')
            .transition()
            .call(d3.axisBottom(xLeft)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height));
        
        svg.select('.x.axis.right')
            .transition()
            .call(d3.axisBottom(xRight)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height));
    }

    d3.select('#bars')
        .selectAll('rect')
        .data(selectedData)
        .join('rect')
        .attr('fill', d =>
            d.sex === 'female' ?
                config.colourPalette[0] :
                config.colourPalette[1]
        )
        .attr('y', d => y(d.age))
        .attr('height', y.bandwidth())
        .transition()
        .attr('x', d =>
            d.sex === 'female' ? xLeft(d.percentage) : xRight(0)
        )
        .attr('width', d =>
            d.sex === 'female' ?
                xLeft(0) - xLeft(d.percentage) :
                xRight(d.percentage) - xRight(0)
        );

    if (config.hasInteractiveComparison && tidydataComparisonPercentage) {
        console.log("interactive comparison", tidydataComparisonPercentage)
        d3.select('#comparisonLineLeft')
            .attr('opacity', 1)
            .transition()
            .attr('d',
                lineLeft(
                    tidydataComparisonPercentage
                        .filter(d => d.AREACD === areacd)
                        .filter(d => d.sex === 'female')
                ) + 'l 0 ' + -y.bandwidth()
            );

        d3.select('#comparisonLineRight')
            .attr('opacity', 1)
            .transition()
            .attr('d',
                lineRight(
                    tidydataComparisonPercentage
                        .filter(d => d.AREACD === areacd)
                        .filter(d => d.sex === 'male')
                ) + 'l 0 ' + -y.bandwidth()
            );
    } else {
        console.log("static comparison")
        if (config.hasComparison) {
            addComparisonLines();
        }
    }
}

function onToggleChange(value) {
    const dataToUse = value == 0 ? comparisonData_new : time_comparisonData_new;

    d3.select('#comparisonLineLeft')
        .transition()
        .attr('d', lineLeft(dataToUse) + 'l 0 ' + -y.bandwidth());

    d3.select('#comparisonLineRight')
        .transition()
        .attr('d', lineRight(dataToUse) + 'l 0 ' + -y.bandwidth());

    // Update legend
    d3.selectAll("p.legend--text.itemy")
        .text(config.buttonLabels[value]);
}

function clearChart() {
    d3.select('#bars')
        .selectAll('rect')
        .transition()
        .attr('x', d => d.sex === 'female' ? xLeft(0) : xRight(0))
        .attr('width', 0);

    if (config.hasInteractiveComparison) {
        d3.select('#comparisonLineLeft').transition().attr('opacity', 0);
        d3.select('#comparisonLineRight').transition().attr('opacity', 0);
    }

    // Add this block for auto-each scaling reset
    if (config.xDomain === 'auto-each') {
        const resetMaxPercentage = d3.max(tidydataPercentage, d => d.percentage);
        
        xLeft.domain([0, resetMaxPercentage]);
        xRight.domain([0, resetMaxPercentage]);
        
        svg.select('.x.axis')
            .transition()
            .call(d3.axisBottom(xLeft)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height));
        
        svg.select('.x.axis.right')
            .transition()
            .call(d3.axisBottom(xRight)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height));
    }
}

// Utility function for pivoting data (from Observable)
function pivot(data, columns, name, value) {
    const keep = data.columns.filter(c => !columns.includes(c));
    return data.flatMap(d => {
        const base = keep.map(k => [k, d[k]]);
        return columns.map(c => {
            return Object.fromEntries([...base, [name, c], [value, d[c]]]);
        });
    });
}

// Load data and initialize based on config
const dataPromises = [d3.csv(config.graphicDataURL, d3.autoType)];

if (config.hasComparison && config.comparisonData) {
    dataPromises.push(d3.csv(config.comparisonData, d3.autoType));
}

if (config.interactionType === 'toggle' && config.comparisonTimeData) {
    dataPromises.push(d3.csv(config.comparisonTimeData, d3.autoType));
}

Promise.all(dataPromises).then(dataArrays => {
    graphic_data = dataArrays[0];

    if (dataArrays.length > 1) {
        comparisonData = dataArrays[1];
    }

    if (dataArrays.length > 2) {
        time_comparisonData = dataArrays[2];
    }

    // Initialize pym
    pymChild = new pym.Child({
        renderCallback: drawGraphic
    });
});