
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
let scaleField = config.displayType === 'percentages' ? 'percentage' : 'value';


// Chart variables
let maxPercentage, width, chartWidth, height;
let xLeft, xRight, y, svg, lineLeft, lineRight, comparisons;
let widths, dataForLegend, titleDivs;

function drawGraphic() {
    // Clear existing graphics
    titles.selectAll('*').remove();
    legend.selectAll('*').remove();

    // Set up basics
    size = initialise(size);

    let margin = config.margin[size];
    margin.centre = config.margin.centre;
    // Process data based on structure type
    processAllData(config, graphicData);

    primaryData = tidyDatasets[0]


    if (config.pyramidInteractionType === 'toggle') {
        d3.select('#nav').selectAll('*').remove();
        buildToggleControls();
    }
    if (config.pyramidInteractionType === 'dropdown') {
        d3.select('#select').selectAll('*').remove();
        buildDropdownControls(tidyDatasets[0]);
    }

    console.log("scenario", scenario)

    // maxPercentage = findMax(tidyDatasets)/
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
        .data(config.datasetLabels)
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
        config.datasetLabels[0] + ' is selected'
    );

    // Button interactivity
    d3.selectAll('input[type="radio"]').on('change', function () {
        const selectedValue = document.querySelector('input[name="button"]:checked').value;

        if(scenario.hasComparison) onToggleChangeComparison(selectedValue)

        onToggleChangeBars(selectedValue)
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
        } else if (scenario.comparisonType === 'tidy' || scenario.comparisonType === "simple") {
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
        // Always calculate percentage
        const malePercent = isCounts ? d.maleBar / total : d.maleBar;
        const femalePercent = isCounts ? d.femaleBar / total : d.femaleBar;

        let result = [];
        result.push({
            age: d.age,
            sex: "male",
            percentage: malePercent,
            ...(isCounts ? { value: d.maleBar } : {})
        });
        result.push({
            age: d.age,
            sex: "female",
            percentage: femalePercent,
            ...(isCounts ? { value: d.femaleBar } : {})
        });
        return result;
    });

    return tidy;
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


function getXDomain(areacd) {
    // Flatten datasets robustly in case .flat isn't available
    const allData = Array.isArray(tidyDatasets?.flat)
        ? tidyDatasets.flat()
        : [].concat(...tidyDatasets);

    const dataForMax = areacd
        ? allData.filter(e => e && e.AREACD === areacd)
        : allData;

    if (Array.isArray(config.xDomain)) {
        return config.xDomain;
    } else if (config.xDomain === 'auto-each' || config.xDomain === "auto") {
        let maxVal = d3.max(dataForMax, d => d[scaleField]);
        return [0, maxVal || 1];
    }
}

function createChart(margin) {
    // Set up dimensions
    width = parseInt(graphic.style('width'));
    chartWidth = (width - margin.centre - margin.left - margin.right) / 2;

    if (config.pyramidDataStructure === 'simple') {
        height = (primaryData.length / 2) * config.seriesHeight[size];
    } else {
        height = allAges.length * config.seriesHeight[size];
    }

    // Set up scales
    // Determine which field to use for scaling: 'value' for counts, 'percentage' for percentages
    const xDomain = getXDomain();

    xLeft = d3.scaleLinear()
        .domain(xDomain)
        .rangeRound([chartWidth, 0]);

    xRight = d3.scaleLinear()
        .domain(xDomain)
        .rangeRound([chartWidth + margin.centre, chartWidth * 2 + margin.centre]);

    if (config.pyramidDataStructure === 'simple') {
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
        const field = config.displayType === 'counts' ? 'value' : 'percentage';
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
    if (config.pyramidInteractionType === 'dropdown') {
        addBars([]); // Start with empty bars for dropdown
    } else {
        addBars(primaryData);
    }

    // Add axis labels
    addAxisLabels(margin);

    // Add legend
    addLegend(margin);

    // Add comparison lines
    if (scenario.hasComparison) {
        addComparisonLines();
        // Show default comparison lines for static or dropdown scenarios
        if (scenario.comparisonInteraction === 'static') {
            // For static, use the first comparison dataset
            updateComparisonLines(tidyDatasets[tidyDatasets.length-1]);
            return;
        } else if (scenario.comparisonType === 'array') {
            // Use the first area code in the pyramid data as default
            let defaultArea = null, comp;
            if (scenario.pyramidType === 'dropdown-array' && tidyDatasets[0] && tidyDatasets[0][0]) {
                defaultArea = tidyDatasets[0][0].AREACD;
            }

            if (defaultArea) {
                comp = tidyDatasets.slice(config.pyramidData.length).find(ds => ds.some(d => d.AREACD === defaultArea));
                comp = comp ? comp.filter(d => d.AREACD === defaultArea) : [];
            } else {
                comp = tidyDatasets.slice(config.pyramidData.length)[0] || [];
            }
            updateComparisonLines(comp);

        }
    }
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

function addBars(data) {
    svg.append("g")
        .attr("id", "bars")
        .selectAll("rect")
        .data(data)
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
            .attr("x", function (d) {
                // For left bars (female), shrink to right edge
                if (d.sex === "female") {
                    return xLeft.range()[0]; // right edge of left axis
                } else {
                    return xRight(0); // keep right bars at left edge
                }
            })
            .attr("width", 0)
            .remove()
        )
    );
}

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

function updateComparisonLines(dataset, animate = true) {
    if (!scenario.hasComparison) return;

    const leftData = dataset.filter ? dataset.filter(d => d.sex === "female") : [];
    const rightData = dataset.filter ? dataset.filter(d => d.sex === "male") : [];

    const tLeft = d3.select("#comparisonLeft");
    const tRight = d3.select("#comparisonRight");

    const trans = animate ? d3.transition().duration(300) : null;

    tLeft
        .attr("opacity", leftData.length ? 1 : 0)
        .transition(trans)
        .attr("d", leftData.length ? (lineLeft(leftData) + "l 0 " + -y.bandwidth()) : "");

    tRight
        .attr("opacity", rightData.length ? 1 : 0)
        .transition(trans)
        .attr("d", rightData.length ? (lineRight(rightData) + "l 0 " + -y.bandwidth()) : "");
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

    if (scenario.hasComparison) {
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

        const legendTextClass = config.pyramidInteractionType === 'toggle' ?
            (d) => 'legend--text ' + 'item' + d : 'legend--text';

        titleDivs.append('div')
            .append('p')
            .attr('class', legendTextClass)
            .html(d => {
                if (d === 'x') {
                    return config.legend[0];
                } else if (config.pyramidInteractionType === 'toggle') {
                    return config.datasetLabels[0];
                } else {
                    return config.legend[1];
                }
            });
    }
}

function changeDataFromDropdown(areacd) {
    // Get pyramid data for selected area
    let newBars = (scenario.pyramidType === 'dropdown-tidy')
        ? tidyDatasets[0].filter(d => d.AREACD === areacd)
        : (tidyDatasets.find(ds => ds.some(d => d.AREACD === areacd)) || []).filter(d => d.AREACD === areacd);

    // Get comparison data for selected area
    let compData = [];
    if (scenario.hasComparison) {
        if (scenario.comparisonInteraction === 'dropdown') {
            compData = (scenario.comparisonType === 'tidy')
                ? tidyDatasets[tidyDatasets.length - 1].filter(d => d.AREACD === areacd)
                : ((tidyDatasets.slice(config.pyramidData.length).find(ds => ds.some(d => d.AREACD === areacd)) || []).filter(d => d.AREACD === areacd));
        } else if (scenario.comparisonInteraction === 'static') {
            compData = tidyDatasets[tidyDatasets.length-1];
        }
    }

    // Auto-each scaling
    if (config.xDomain === "auto-each") {
        const allForMax = [...newBars, ...compData];
        const newMax = d3.max(allForMax, d => d[scaleField]);
        xLeft.domain([0, newMax || 1]);
        xRight.domain([0, newMax || 1]);
        updateAxes();
    }

    updateBars(newBars);

    // Comparison line logic
    if (scenario.hasComparison) {
        if (scenario.comparisonInteraction === 'dropdown') {
            updateComparisonLines(compData);
        } else if (scenario.comparisonInteraction === 'static') {
            updateComparisonLines(tidyDatasets[tidyDatasets.length-1]);
        }
    }
}

function onToggleChangeComparison(value) {
    // If static comparison, always use the static comparison dataset (last in tidyDatasets)
    if (config.comparisonInteractionType === "static") {
        updateComparisonLines(tidyDatasets[tidyDatasets.length - 1]);
        console.log("static")
    } else {
        // For toggles, comparison data is after pyramid data in tidyDatasets
        const compIndex = scenario.pyramidType === 'toggle' || scenario.pyramidType === 'dropdown-array'
            ? config.pyramidData.length + Number(value)
            : config.pyramidData.length; // fallback
        console.log(compIndex, "compIndex")
        console.log(tidyDatasets[compIndex][0])
        updateComparisonLines(tidyDatasets[compIndex]);
    }

    d3.selectAll("p.legend--text.itemy")
        .text(config.datasetLabels[value]);
}

function onToggleChangeBars(value) {
    console.log("bars",value)
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

function clearChart() {
    updateBars([], false);   // remove all bars
    if(config.comparisonInteractionType != "static") {
        updateComparisonLines([], false); // hide comp lines
    } else {
        updateComparisonLines(tidyDatasets[tidyDatasets.length-1],false)
    }

    if (config.xDomain === "auto-each" || config.xDomain === "auto") {
        const resetMax = getXDomain();
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
        } else if (typeof config.comparisonData === 'string' && config.comparisonDataStructure === "complex" && config.comparisonData.endsWith('.csv')) {
            comparisonType = 'tidy';
        } else if (typeof config.comparisonData === 'string' && config.comparisonDataStructure === "simple" && config.comparisonData.endsWith('.csv')) {
            comparisonType = "simple"
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
    } else if (scenario.comparisonType === 'tidy' || scenario.comparisonType === "simple") {
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