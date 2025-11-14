config = {
	// Added a dataNumeric.csv to the folder to demonstrate a numeric x axis
	"graphicDataURL": "data.csv",
	"colourPalette": "YlGnBu",
	// colour brewer palette or custom array of colours
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"dataLabelsNumberFormat": ".0f",
	"xAxisLabel": "x axis label",
	"numberOfBreaks": 5,
	"breaks": "jenks",
	// either "jenks","equal" or an array with custom breaks
	"cascadeX": true,
	//turns on or off cascading xaxis label
	"legendFormat": ".0f",
	// If you have categorical x axis, set to true to show all ticks
	"xTicksAll": true,
	// If you have numeric data on the x axis:
	"xAxisTicks": [], // leave empty to use automatic ticks instead, specify n below
	"xAxisTicksAuto": {
		"sm": 3,
		"md": 3,
		"lg": 4
	},
	"margin": {
		"sm": {
			"top": 180,
			"right": 20,
			"bottom": 50,
			"left": 120
		},
		"md": {
			"top": 180,
			"right": 20,
			"bottom": 50,
			"left": 120
		},
		"lg": {
			"top": 180,
			"right": 20,
			"bottom": 50,
			"left": 120
		}
	},
	"seriesHeight": {
		"sm": 40,
		"md": 40,
		"lg": 40
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
