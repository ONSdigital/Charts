config = {
	"graphicDataURL": "data.csv",
	"colourScheme":"direction", //"categories" or "direction"
	"categoryPalette": ONSlinePalette,
	"directionPalette": ONScolours.diverging.negativeToPositiveAlt["3"],
	"textColourPalette": ONStextPalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"yDomainMax": "auto",  //"auto" for automatic y-axis max, or a number for fixed max
	"showZeroAxis":true,
	"yAxisLabel": "y axis label",
	"yAxisTicks":{
		"sm": 5,
		"md": 5,
		"lg": 5
	},
	"xAxisLabels": ["Q1 2018","Q1 2021"],
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 30,
			"right": 0,
			"bottom": 50,
			"left": 0
		},
		"md": {
			"top": 30,
			"right": 100,
			"bottom": 50,
			"left": 80
		},
		"lg": {
			"top": 30,
			"right": 100,
			"bottom": 50,
			"left": 60
		}
	},
};
