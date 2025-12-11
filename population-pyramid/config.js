const config = {
    // Data settings
    // pyramidData: string (single file), array of strings (toggle), or string (tidydata file for complex/dropdown)
    pyramidData: ["population-simple.csv","population-simple-two.csv", "population-comparison-simple.csv", "population-comparison-simple-two.csv"], // e.g. "population-simple.csv" | ["pop-2021.csv", "pop-2011.csv"] | "population-tidydata.csv"
    pyramidDataType: "counts", // "counts" or "percentages" or array if multiple datasets
    pyramidDataStructure: "simple", // "simple" or "complex" or array if multiple datasets

    // comparisonData: optional, same structure as pyramidData (string, array, or tidydata file link)
    comparisonData: ["population-comparison-simple.csv", "population-comparison-simple-two.csv"], // or "population-comparison-complex.csv"
    comparisonDataType: "counts", // "counts" or "percentages" or array
    comparisonDataStructure: "simple", // "simple" or "complex" or array

    // Scenario detection:
    // - If pyramidData is string: simple pyramid
    // - If pyramidData is array: toggle interaction
    // - If pyramidData is a tidydata file link: dropdown with tidy/complex data
    // - If comparisonData present: comparison line
    // - If both dropdown and comparisonData: dropdown updates both
    // - If dropdown and static comparisonData: dropdown pyramid, static comparison

    // Interaction settings
    // sets interaction for changing pyramid data
    pyramidInteractionType: "toggle", // "static", "toggle", "dropdown"
    // Comparison interaction flag: determines how comparison line behaves
    // "static" (single comparison), "toggle" (matches pyramid toggle), "dropdown" (updates with pyramid dropdown), etc.
    comparisonInteractionType: "toggle", // default is static; set to "toggle" or "dropdown" as needed

    // labels for toggle or dropdown
    datasetLabels: ["2021 Census", "2011 Census","3","4"],

    // Display settings
    xDomain: "auto-each",//"auto", "auto-each" or a range in an array e.g [0,100]
    xAxisLabel: "Percentage of population",
    yAxisLabel: "Age",
    xAxisNumberFormat: ".1%",
    yAxisTicksEvery: 10,
    displayType: "percentages", // "counts" or "percentages"
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
        sm: { top: 25, right: 20, bottom: 35, left: 20 },
        md: { top: 25, right: 30, bottom: 60, left: 30 },
        lg: { top: 25, right: 40, bottom: 70, left: 40 },
        centre: 50 // Gap between male/female sides
    },
    seriesHeight: {
        sm: 6,
        md: 6,
        lg: 6
    },
    xAxisTicks: {
        sm: 2,
        md: 6,
        lg: 4
    },
}