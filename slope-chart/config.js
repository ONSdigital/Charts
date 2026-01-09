config = {
	"graphicDataURL": "data.csv",
	"colourScheme":"direction", //"categories" or "direction"
	"colourPalette":[ONScolours.coralPink,ONScolours.grey30,ONScolours.oceanBlue],
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
		"sm": [1, 2],
		"md": [1, 2],
		"lg": [1, 2]
	},
	"margin": {
		"sm": {
			"top": 30,
			"right": 0,
			"bottom": 10,
			"left": 0
		},
		"md": {
			"top": 30,
			"right": 0,
			"bottom": 10,
			"left": 0
		},
		"lg": {
			"top": 30,
			"right": 0,
			"bottom": 10,
			"left": 0
		}
	},
};
