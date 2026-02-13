config = {
	"graphicDataURL": "data.csv",
	"colourScheme":"direction", //"categories" or "direction"
	"colourPalette":[ONScolours.coralPink,ONScolours.grey30,ONScolours.oceanBlue],
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"yDomainMin": "auto",
	"yDomainMax": "auto",
	// yDomainMin and yDomainMax can be "auto", "data", or a numeric value	
	"showZeroAxis":true,
	"yAxisLabel": "y axis label",
	"yAxisTicks":{
		"sm": 5,
		"md": 5,
		"lg": 5
	},
	"lineCurveType": "curveLinear",
	"xAxisLabels": ["Q1 2018","Q1 2021"],
	"aspectRatio": {
		"sm": [1, 2],
		"md": [1, 2],
		"lg": [1, 2]
	},
	"margin": {//left and right are set by the script
		"sm": {
			"top": 30,
			"bottom": 10,
		},
		"md": {
			"top": 30,
			"bottom": 10,
		},
		"lg": {
			"top": 30,
			"bottom": 10,
		}
	},
};
