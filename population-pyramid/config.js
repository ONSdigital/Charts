const config = {
    // Data settings
    primaryData: "population-simple.csv",
    primaryDataType: "counts", // "counts" or "percentages"
    primaryDataStructure: "simple", // "simple" (age, maleBar, femaleBar) or "complex" (pivot structure)

    secondaryData:["population-comparison-simple.csv"], // population-comparison-complex.csv, population-comparison-simple.csv
    secondaryDataType: ["counts"], // "counts" or "percentages"
    secondaryDataStructure: ["simple"], // "simple" (age, maleBar, femaleBar) or "complex" (pivot structure)


    // Interaction settings
    interactionType: "toggle", // "static", "toggle", "dropdown"
    hasComparison: false,
    hasInteractiveComparison: false, // For dropdown version with comparison lines

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
    accessibleSummary: "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",

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