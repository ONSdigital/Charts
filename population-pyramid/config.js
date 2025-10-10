const config = {
    // Data settings
    graphic_data_url: "population-complex.csv",
    comparisonData: "population-comparison-complex.csv",
    comparisonTimeData: "population-comparison-time.csv",
    dataType: "counts", // "counts" or "percentages"
    dataStructure: "complex", // "simple" (age, maleBar, femaleBar) or "complex" (pivot structure)

    // Interaction settings
    interactionType: "dropdown", // "static", "toggle", "dropdown"
    hasComparison: true,
    hasInteractiveComparison: true, // For dropdown version with comparison lines

    // Button labels for toggle
    buttonLabels: ["2021 Census", "2011 Census"],

    // Display settings
    xDomain: "auto",//"auto", "auto-each" or a range in an array e.g [0,100]
    xAxisLabel: "Percentage of population",
    yAxisLabel: "Age",
    xAxisNumberFormat: ".1%",
    yAxisTicksEvery: 10,
    displayType: "counts", // "counts" or "percentages"
    // Colors
    colourPalette: [ONScolours.femaleLight, ONScolours.male],
    comparisonColourPalette: [ONScolours.grey100, ONScolours.grey100], // Comparison Female, Male

    // Legend
    legend: ["Current population", "Comparison population"],

    // Source
    sourceText: "Census data 2021",

    // accessible summary
    accessibleSummary: "This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",

    margin: {
        sm: { top: 15, right: 20, bottom: 50, left: 20 },
        md: { top: 20, right: 30, bottom: 60, left: 30 },
        lg: { top: 40, right: 40, bottom: 70, left: 40 },
        centre: 50 // Gap between male/female sides
    },
    seriesHeight: {
        sm: 6,
        md: 6,
        lg: 6
    },
    xAxisTicks: {
        sm: 4,
        md: 6,
        lg: 4
    }
}