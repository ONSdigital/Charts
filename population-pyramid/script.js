
import { initialise, wrap, addSvg, addAxisLabel, addSource } from "../lib/helpers.js";
import { EnhancedSelect } from "../lib/enhancedSelect.js"

const graphic = d3.select('#graphic');
const titles = d3.select('#titles');
const legend = d3.select('#legend');
let pymChild = null;

// Data variables
let graphicData, dropdownData;
let size, allAges;
let primaryData
let tidyDatasets = [];

// Chart variables
let maxPercentage, width, chartWidth, height;
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



    // Set up basics
    size = initialise(size);

    let margin = config.margin[size];
    margin.centre = config.margin.centre;
    // Process data based on structure type
    processAllData(config, graphicData);

    primaryData = tidyDatasets[0]

    // Build interaction controls based on config
    if (config.pyramidInteractionType === 'toggle') {
        buildToggleControls();
    } else if (config.pyramidInteractionType === 'dropdown') {
        buildDropdownControls(tidyDatasets[0]);
    }

    maxPercentage = findMax(tidyDatasets)
    // Create chart
    createChart(margin);
console.log(tidyDatasets)
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
        scenario.hasComparison ? onToggleChangeComparison(selectedValue) : onToggleChangeBars(selectedValue);
        d3.select('#selected').text(
            config.datasetLabels[selectedValue] + ' is selected'
        );
    });
}

function buildDropdownControls(data) {
    // Build dropdown with unique areas
    dropdownData = data
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

function processAllData(config, dataArray) {
    tidyDatasets.length = 0; // reset

    // Use scenario detection to process datasets
    // Pyramid datasets
    if (scenario.pyramidType === 'simple' || scenario.pyramidType === 'dropdown-tidy') {
        tidyDatasets.push(
            processDataset(
                dataArray[0],
                config.pyramidDataStructure,
                config.pyramidDataType
            )
        );
    } else if (scenario.pyramidType === 'toggle' || scenario.pyramidType === 'dropdown-array') {
        config.pyramidData.forEach((file, i) => {
            tidyDatasets.push(
                processDataset(
                    dataArray[i],
                    Array.isArray(config.pyramidDataStructure) ? config.pyramidDataStructure[i] : config.pyramidDataStructure,
                    Array.isArray(config.pyramidDataType) ? config.pyramidDataType[i] : config.pyramidDataType
                )
            );
        });
    }

    // Comparison datasets
    if (scenario.hasComparison) {
        let offset = tidyDatasets.length;
        if (scenario.comparisonType === 'array') {
            config.comparisonData.forEach((file, i) => {
                tidyDatasets.push(
                    processDataset(
                        dataArray[offset + i],
                        Array.isArray(config.comparisonDataStructure) ? config.comparisonDataStructure[i] : config.comparisonDataStructure,
                        Array.isArray(config.comparisonDataType) ? config.comparisonDataType[i] : config.comparisonDataType
                    )
                );
            });
        } else if (scenario.comparisonType === 'tidy') {
            tidyDatasets.push(
                processDataset(
                    dataArray[offset],
                    config.comparisonDataStructure,
                    config.comparisonDataType
                )
            );
        }
    }
}

function processDataset(data, structure, type) {
    if (structure === "simple") {
        return processSimple(data, type);
    } else if (structure === "complex") {
        return processComplex(data, type);
    }
}

function processSimple(data, dataType) {
    const isCounts = dataType === "counts";

    let total = isCounts
        ? d3.sum(data, d => d.maleBar + d.femaleBar)
        : 1;

    const tidy = data.flatMap(d => {
        const male = isCounts ? d.maleBar / total : d.maleBar;
        const female = isCounts ? d.femaleBar / total : d.femaleBar;

        return [
            { age: d.age, sex: "male", value: male },
            { age: d.age, sex: "female", value: female }
        ];
    });

    return tidy.flatMap(d => d);
}


function processComplex(data, dataType) {
    const isCounts = dataType === "counts";

    allAges = data.columns.slice(3);

    const tidy = pivot(data, allAges, "age", "value");

    let totals = null;
    if (isCounts) {
        totals = d3.rollup(
            tidy,
            v => d3.sum(v, d => d.value),
            d => d.AREACD
        );
    }

    const tidyPercent = tidy.map(d => ({
        ...d,
        percentage: isCounts ? d.value / totals.get(d.AREACD) : d.percentage
    }));

    return tidyPercent;
}


function findMax(tidyDatasets) {
    return d3.max(tidyDatasets.flat(), d => d.value);
}

// Update both x axes after domain changes
function updateAxes() {
    svg.select('.x.axis')
        .transition()
        .call(
            d3.axisBottom(xLeft)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height)
        );
    svg.select('.x.axis.right')
        .transition()
        .call(
            d3.axisBottom(xRight)
                .tickFormat(d3.format(config.xAxisNumberFormat))
                .ticks(config.xAxisTicks[size])
                .tickSize(-height)
        );
}

function createChart(margin) {
    // Set up dimensions
    width = parseInt(graphic.style('width'));
    chartWidth = (width - margin.centre - margin.left - margin.right) / 2;

    if (config.primaryDataStructure === 'simple') {
        height = (primaryData.length / 2) * config.seriesHeight[size];
    } else {
        height = allAges.length * config.seriesHeight[size];
    }

    // Set up scales
    // Determine which field to use for scaling: 'value' for counts, 'percentage' for percentages
    let scaleField;
    if (config.displayType === 'percentages') {
        scaleField = 'percentage';
    } else {
        scaleField = 'value';
    }

    // Find max for both bars and comparison lines
    let allData = tidyDatasets.flat();
    let maxValue = d3.max(allData, d => d[scaleField]);
    if (!maxValue || isNaN(maxValue)) {
        maxValue = 1; // fallback
    }

    xLeft = d3.scaleLinear()
        .domain([0, maxValue])
        .rangeRound([chartWidth, 0]);

    xRight = d3.scaleLinear()
        .domain(xLeft.domain())
        .rangeRound([chartWidth + margin.centre, chartWidth * 2 + margin.centre]);

    if (config.primaryDataStructure === 'simple') {
        y = d3.scaleBand()
            .domain([...new Set(primaryData.map(d => d.age))])
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
        chartWidth: width,
        height: height + margin.top + margin.bottom,
        margin: margin
    });

    // Create line generators for comparison lines
    if (scenario.hasComparison) {
        // Use 'percentage' for percentage data, 'value' for count data
        const field = config.comparisonDataType === 'counts' ? 'value' : 'percentage';
        lineLeft = d3.line()
            .curve(d3.curveStepBefore)
            .x(d => xLeft(d[field]))
            .y(d => y(d.age) + y.bandwidth());

        lineRight = d3.line()
            .curve(d3.curveStepBefore)
            .x(d => xRight(d[field]))
            .y(d => y(d.age) + y.bandwidth());
    }

    // Add axes
    addAxes(margin);

    // Add bars
    addBars(primaryData);

    // Add comparison lines
    if (scenario.hasComparison) {
        addComparisonLines();
        // Show default comparison lines for static or dropdown scenarios
        if (scenario.comparisonInteraction === 'static') {
            // For static, use the first comparison dataset
            updateComparisonLines(tidyDatasets[config.pyramidData.length]);
        } else if (scenario.comparisonInteraction === 'dropdown') {
            // For dropdown, show the default area (first in dropdownData or first in dataset)
            let comp;
            if (scenario.comparisonType === 'tidy') {
                // Use the first area code in the pyramid data as default
                comp = null;
                return;
            } else if (scenario.comparisonType === 'array') {
                // Use the first area code in the pyramid data as default
                let defaultArea = null;
                if (scenario.pyramidType === 'dropdown-array' && tidyDatasets[0] && tidyDatasets[0][0]) {
                    defaultArea = tidyDatasets[0][0].AREACD;
                }
                if (defaultArea) {
                    comp = tidyDatasets.slice(config.pyramidData.length).find(ds => ds.some(d => d.AREACD === defaultArea));
                    comp = comp ? comp.filter(d => d.AREACD === defaultArea) : [];
                } else {
                    comp = tidyDatasets.slice(config.pyramidData.length)[0] || [];
                }
            }
            updateComparisonLines(comp);
        }
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
        .attr('transform', `translate(${chartWidth + margin.centre / 2 - 3},0)`)
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

function addBars(initialData) {
    svg.append("g")
        .attr("id", "bars")
        .selectAll("rect")
        .data(initialData)
        .join("rect")
        .attr("class", "bar")
        .attr("fill", d => d.sex === "female" ? config.colourPalette[0] : config.colourPalette[1])
        .attr("y", d => y(d.age))
        .attr("height", y.bandwidth())
        .attr("x", d => getBarX(d))     // initial render
        .attr("width", d => getBarWidth(d));
}

function updateBars(newData, animate = true) {
    const bars = d3.select("#bars")
        .selectAll("rect")
        .data(newData, d => d.age + "-" + d.sex);

    bars.join(
        enter => enter
            .append("rect")
            .attr("class", "bar")
            .attr("fill", d => d.sex === "female" ? config.colourPalette[0] : config.colourPalette[1])
            .attr("y", d => y(d.age))
            .attr("height", y.bandwidth())
            .attr("x", d => getBarX(d, true))
            .attr("width", d => getBarWidth(d, true))
            .call(enter => enter.transition()
                .attr("x", d => getBarX(d))
                .attr("width", d => getBarWidth(d))
            ),

        update => update.call(update => {
            const t = animate ? update.transition() : update;

            t.attr("x", d => getBarX(d))
             .attr("width", d => getBarWidth(d));
        }),

        exit => exit.call(exit => exit.transition()
            .attr("width", 0)
            .remove()
        )
    );
}


// function addBars() {
//     let barData;
//     if (config.primaryDataStructure === 'simple') {
//         barData = primaryData;
//     } else if (config.interactionType === 'dropdown') {
//         barData = tidydataPercentage.filter(d => d.AREACD === graphicData[0].AREACD);
//     } else {
//         barData = tidydataPercentage;
//     }
// console.log(barData)
//     const bars = svg.append('g')
//         .attr('id', 'bars')
//         .selectAll('rect')
//         .data(barData)
//         .join('rect')
//         .attr('fill', d =>
//             d.sex === 'female' ?
//                 config.colourPalette[0] :
//                 config.colourPalette[1]
//         )
//         .attr('y', d => y(d.age))
//         .attr('height', y.bandwidth());

//     if (config.interactionType === 'dropdown') {
//         bars.attr('x', d => d.sex === 'female' ? xLeft(0) : xRight(0))
//             .attr('width', 0);
//     } else {
//         const valueField = config.primaryDataStructure === 'simple' ? 'value' : 'percentage';
//         bars.attr('x', d => d.sex === 'female' ? xLeft(d[valueField]) : xRight(0))
//             .attr('width', d =>
//                 d.sex === 'female' ?
//                     xLeft(0) - xLeft(d[valueField]) :
//                     xRight(d[valueField]) - xRight(0)
//             );
//     }
// }

function addComparisonLines() {
    const g = svg.append("g").attr("id", "comparisonGroup");

    g.append("path")
        .attr("id", "comparisonLeft")
        .attr("class", "line")
        .attr("stroke", config.comparisonColourPalette[0])
        .attr("stroke-width", 2);

    g.append("path")
        .attr("id", "comparisonRight")
        .attr("class", "line")
        .attr("stroke", config.comparisonColourPalette[1])
        .attr("stroke-width", 2);
}


// function addComparisonLines() {
//     comparisons = svg.append('g');

//     if (config.primaryDataStructure === 'simple') {
//         comparisons.append('path')
//             .attr('class', 'line')
//             .attr('id', 'comparisonLineLeft')
//             .attr('d', lineLeft(comparisonDataNew) + 'l 0 ' + -y.bandwidth())
//             .attr('stroke', config.comparisonColourPalette[0])
//             .attr('stroke-width', '2px');

//         comparisons.append('path')
//             .attr('class', 'line')
//             .attr('id', 'comparisonLineRight')
//             .attr('d', lineRight(comparisonDataNew) + 'l 0 ' + -y.bandwidth())
//             .attr('stroke', config.comparisonColourPalette[1])
//             .attr('stroke-width', '2px');
//     } else if (config.interactionType === 'dropdown') {
//         comparisons.append('path')
//             .attr('class', 'line')
//             .attr('id', 'comparisonLineLeft')
//             .attr('stroke', config.comparisonColourPalette[0])
//             .attr('stroke-width', '2px')
//             .attr('opacity', config.hasInteractiveComparison ? 0 : 1);

//         comparisons.append('path')
//             .attr('class', 'line')
//             .attr('id', 'comparisonLineRight')
//             .attr('stroke', config.comparisonColourPalette[1])
//             .attr('stroke-width', '2px')
//             .attr('opacity', config.hasInteractiveComparison ? 0 : 1);

//         if (!config.hasInteractiveComparison) {
//             d3.select('#comparisonLineLeft')
//                 .attr('d', lineLeft(comparisonDataNew) + 'l 0 ' + -y.bandwidth());
//             d3.select('#comparisonLineRight')
//                 .attr('d', lineRight(comparisonDataNew) + 'l 0 ' + -y.bandwidth());
//         }
//     }
// }

function updateComparisonLines(dataset, animate = true) {
    if (!scenario.hasComparison) return;

    const leftData = dataset.filter(d => d.sex === "female");
    const rightData = dataset.filter(d => d.sex === "male");
console.log(leftData,rightData)
    const tLeft = d3.select("#comparisonLeft");
    const tRight = d3.select("#comparisonRight");

    const trans = animate ? d3.transition().duration(300) : null;

    tLeft
        .attr("opacity", 1)
        .transition(trans)
        .attr("d", lineLeft(leftData) + "l 0 " + -y.bandwidth());

    tRight
        .attr("opacity", 1)
        .transition(trans)
        .attr("d", lineRight(rightData) + "l 0 " + -y.bandwidth());
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
        xPosition: chartWidth + margin.centre / 2,
        yPosition: -15,
        text: config.yAxisLabel,
        textAnchor: "middle",
        wrapWidth: width
    });
}

function addLegend(margin) {
    widths = [chartWidth + margin.left, chartWidth + margin.right];

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

// function changeDataFromDropdown(areacd) {

//     const selectedData = tidyDatasets[1].filter(d => d.AREACD === areacd);

//     // Add this block for auto-each scaling
//     if (config.xDomain === 'auto-each') {
//         const newMaxPercentage = d3.max(selectedData, d => d.percentage);

//         xLeft.domain([0, newMaxPercentage]);
//         xRight.domain([0, newMaxPercentage]);

//         // Update axes with transition
//         svg.select('.x.axis')
//             .transition()
//             .call(d3.axisBottom(xLeft)
//                 .tickFormat(d3.format(config.xAxisNumberFormat))
//                 .ticks(config.xAxisTicks[size])
//                 .tickSize(-height));

//         svg.select('.x.axis.right')
//             .transition()
//             .call(d3.axisBottom(xRight)
//                 .tickFormat(d3.format(config.xAxisNumberFormat))
//                 .ticks(config.xAxisTicks[size])
//                 .tickSize(-height));
//     }

//     d3.select('#bars')
//         .selectAll('rect')
//         .data(selectedData)
//         .join('rect')
//         .attr('fill', d =>
//             d.sex === 'female' ?
//                 config.colourPalette[0] :
//                 config.colourPalette[1]
//         )
//         .attr('y', d => y(d.age))
//         .attr('height', y.bandwidth())
//         .transition()
//         .attr('x', d =>
//             d.sex === 'female' ? xLeft(d.percentage) : xRight(0)
//         )
//         .attr('width', d =>
//             d.sex === 'female' ?
//                 xLeft(0) - xLeft(d.percentage) :
//                 xRight(d.percentage) - xRight(0)
//         );

//     if (config.hasInteractiveComparison && tidydataComparisonPercentage) {
//         d3.select('#comparisonLineLeft')
//             .attr('opacity', 1)
//             .transition()
//             .attr('d',
//                 lineLeft(
//                     tidydataComparisonPercentage
//                         .filter(d => d.AREACD === areacd)
//                         .filter(d => d.sex === 'female')
//                 ) + 'l 0 ' + -y.bandwidth()
//             );

//         d3.select('#comparisonLineRight')
//             .attr('opacity', 1)
//             .transition()
//             .attr('d',
//                 lineRight(
//                     tidydataComparisonPercentage
//                         .filter(d => d.AREACD === areacd)
//                         .filter(d => d.sex === 'male')
//                 ) + 'l 0 ' + -y.bandwidth()
//             );
//     } else {
//         if (config.hasComparison) {
//             addComparisonLines();
//         }
//     }
// }

function changeDataFromDropdown(areacd) {
    // For dropdown scenarios, pyramid data is tidyDatasets[0] (tidy) or tidyDatasets[index] (array)
    let newBars;
    if (scenario.pyramidType === 'dropdown-tidy') {
        newBars = tidyDatasets[0].filter(d => d.AREACD === areacd);
    } else if (scenario.pyramidType === 'dropdown-array') {
        // If dropdown uses array, you may need to map dropdown selection to correct index
        // This logic may need to be customized based on your dropdownData
        newBars = tidyDatasets.find(ds => ds.some(d => d.AREACD === areacd));
        newBars = newBars ? newBars.filter(d => d.AREACD === areacd) : [];
    }
console.log(scenario, tidyDatasets[0], areacd,newBars)
    // Auto-each scaling
    if (config.xDomain === "auto-each") {
        const newMax = d3.max(newBars, d => d.percentage);
        xLeft.domain([0, newMax]);
        xRight.domain([0, newMax]);
        updateAxes();
    }

    updateBars(newBars);

    // Comparison line logic
    if (scenario.hasComparison) {
        if (scenario.comparisonInteraction === 'dropdown') {
            // Comparison data is last in tidyDatasets for tidy, or array for dropdown-array
            let comp;
            if (scenario.comparisonType === 'tidy') {
                comp = tidyDatasets[tidyDatasets.length - 1].filter(d => d.AREACD === areacd);
            } else if (scenario.comparisonType === 'array') {
                comp = tidyDatasets.slice(config.pyramidData.length).find(ds => ds.some(d => d.AREACD === areacd));
                comp = comp ? comp.filter(d => d.AREACD === areacd) : [];
            }
            console.log(comp, "comp")
            updateComparisonLines(comp);
        } else if (scenario.comparisonInteraction === 'static') {
            // Static comparison: just use the first comparison dataset
            updateComparisonLines(tidyDatasets[config.pyramidData.length]);
        }
    }
}


// function onToggleChange(value) {
//     console.log(value, comparisonDataNew, timeComparisonDataNew)
//     const dataToUse = value == 0 ? comparisonDataNew : timeComparisonDataNew;

//     if (config.hasComparison) {
//         d3.select('#comparisonLineLeft')
//             .transition()
//             .attr('d', lineLeft(dataToUse) + 'l 0 ' + -y.bandwidth());

//         d3.select('#comparisonLineRight')
//             .transition()
//             .attr('d', lineRight(dataToUse) + 'l 0 ' + -y.bandwidth());
//     }

//     // Update legend
//     d3.selectAll("p.legend--text.itemy")
//         .text(config.buttonLabels[value]);
// }

function onToggleChangeComparison(value) {
    // For toggles, comparison data is after pyramid data in tidyDatasets
    const compIndex = scenario.pyramidType === 'toggle' || scenario.pyramidType === 'dropdown-array'
        ? config.pyramidData.length + Number(value)
        : config.pyramidData.length; // fallback
    updateComparisonLines(tidyDatasets[compIndex]);

    d3.selectAll("p.legend--text.itemy")
        .text(config.buttonLabels[value]);
}

function onToggleChangeBars(value) {
    // For toggles, pyramid data is at tidyDatasets[value]
    updateBars(tidyDatasets[value]);
    // If comparisonInteraction is 'toggle', update comparison too
    if (scenario.hasComparison && scenario.comparisonInteraction === 'toggle') {
        // Comparison data follows pyramid data in tidyDatasets
        const compIndex = scenario.pyramidType === 'toggle' || scenario.pyramidType === 'dropdown-array'
            ? config.pyramidData.length + Number(value)
            : config.pyramidData.length; // fallback
        updateComparisonLines(tidyDatasets[compIndex]);
    }
}


// function clearChart() {
//     d3.select('#bars')
//         .selectAll('rect')
//         .transition()
//         .attr('x', d => d.sex === 'female' ? xLeft(0) : xRight(0))
//         .attr('width', 0);

//     if (config.hasInteractiveComparison) {
//         d3.select('#comparisonLineLeft').transition().attr('opacity', 0);
//         d3.select('#comparisonLineRight').transition().attr('opacity', 0);
//     }

//     // Add this block for auto-each scaling reset
//     if (config.xDomain === 'auto-each') {
//         const resetMaxPercentage = d3.max(tidydataPercentage, d => d.percentage);

//         xLeft.domain([0, resetMaxPercentage]);
//         xRight.domain([0, resetMaxPercentage]);

//         svg.select('.x.axis')
//             .transition()
//             .call(d3.axisBottom(xLeft)
//                 .tickFormat(d3.format(config.xAxisNumberFormat))
//                 .ticks(config.xAxisTicks[size])
//                 .tickSize(-height));

//         svg.select('.x.axis.right')
//             .transition()
//             .call(d3.axisBottom(xRight)
//                 .tickFormat(d3.format(config.xAxisNumberFormat))
//                 .ticks(config.xAxisTicks[size])
//                 .tickSize(-height));
//     }
// }

function clearChart() {
    updateBars([], true);   // remove all bars
    updateComparisonLines([], true); // hide comp lines

    if (config.xDomain === "auto-each") {
        const resetMax = findMax(tidyDatasets);
        xLeft.domain([0, resetMax]);
        xRight.domain([0, resetMax]);
        updateAxes();
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

function getBarX(d, zero = false) {
    const field = config.primaryDataStructure === "simple" ? "value" : "percentage";
    const v = zero ? 0 : d[field];

    return d.sex === "female" ? xLeft(v) : xRight(0);
}

function getBarWidth(d, zero = false) {
    const field = config.primaryDataStructure === "simple" ? "value" : "percentage";
    const v = zero ? 0 : d[field];

    return d.sex === "female"
        ? xLeft(0) - xLeft(v)
        : xRight(v) - xRight(0);
}


// --- Scenario Detection & Data Loading ---
function detectScenario(config) {
    let pyramidType = Array.isArray(config.pyramidData)
        ? (config.pyramidInteractionType === 'dropdown' ? 'dropdown-array' : 'toggle')
        : (typeof config.pyramidData === 'string' && config.pyramidData.endsWith('.csv'))
            ? (config.pyramidInteractionType === 'dropdown' ? 'dropdown-tidy' : 'simple')
            : 'unknown';

    let hasComparison = !!config.comparisonData;
    let comparisonType = null;
    if (hasComparison) {
        if (Array.isArray(config.comparisonData)) {
            comparisonType = 'array';
        } else if (typeof config.comparisonData === 'string' && config.comparisonData.endsWith('.csv')) {
            comparisonType = 'tidy';
        }
    }

    return {
        pyramidType,
        hasComparison,
        comparisonType,
        comparisonInteraction: config.comparisonInteractionType || 'static'
    };
}

const scenario = detectScenario(config);

// Data loading based on scenario
let dataPromises = [];
if (scenario.pyramidType === 'simple') {
    dataPromises.push(d3.csv(config.pyramidData, d3.autoType));
} else if (scenario.pyramidType === 'toggle' || scenario.pyramidType === 'dropdown-array') {
    config.pyramidData.forEach(file => {
        dataPromises.push(d3.csv(file, d3.autoType));
    });
} else if (scenario.pyramidType === 'dropdown-tidy') {
    dataPromises.push(d3.csv(config.pyramidData, d3.autoType));
}

// Comparison data
if (scenario.hasComparison) {
    if (scenario.comparisonType === 'array') {
        config.comparisonData.forEach(file => {
            dataPromises.push(d3.csv(file, d3.autoType));
        });
    } else if (scenario.comparisonType === 'tidy') {
        dataPromises.push(d3.csv(config.comparisonData, d3.autoType));
    }
}

Promise.all(dataPromises).then(dataArrays => {
    graphicData = dataArrays;
    // Initialize pym
    pymChild = new pym.Child({
        renderCallback: drawGraphic
    });
});