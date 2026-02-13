config = {
	"graphicDataURL": "data.csv",
	"colourPalettePositive": ONScolours.emeraldGreen,
	"colourPaletteNegative": ONScolours.coralPink,
	"colourPaletteBubble": ONScolours.skyBlue,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
	"dataLabels": {
		"show": true,
		"numberFormat": ".1%"
	},
	"dataLabelsBubbleFormat": ".0%",
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisLabel": "x axis label",
	"xAxisTitle": "x axis title",
	"bubbleLabel": "Context bubble label",
	"margin": {
		"sm": {
			"top": 50,
			"bubble": 100,
			"bottom": 50,
			"left": 150,
			"right": 10
		},
		"md": {
			"top": 50,
			"bubble": 100,
			"bottom": 50,
			"left": 180,
			"right": 10
		},
		"lg": {
			"top": 50,
			"bubble": 100,
			"bottom": 50,
			"left": 200,
			"right": 10
		}
	},
	"seriesHeight": {
		"sm": 30,
		"md": 30,
		"lg": 30
	},
	"xAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	},
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};
