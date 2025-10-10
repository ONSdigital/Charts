config = {

	"graphic_data_url": "data.csv",
	"colourPalette": ONScolours.oceanBlue,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is your accessibility summary, dvcXXXX",
	"xDomain": "auto", //auto for auto domain or array [0,50] to define your own
	"yDomain": "auto", //auto for auto domain or array [0,50] to define your own
	"rDomain": [25, 2700], //input the domain for the circles
	"dateFormat": "%Y", //format you want to display
	"dateParse": "%Y", //format you are loading the data in from csv,
	"xDisplayFormat": ".0f", //x axis ticks display format
	"yDisplayFormat": ".0f", //y axis ticks display format
	"legendLabels": ["50 thousand people", "5 million people"], //labels for the legend
	"legendRadius": [100, 3000], //how big you want the legend circles to be
	"legendCX": [-25, 160], //for adusting the legend circle X
	"legendCY": [-50, -25], //for adusting the legend circle X
	"timeLoad": "2022", //Input the time you want the chart to load on if there is a slider
	"xAxisLabel": "Wage growth % year on year",
	"yAxisLabel": "Median hourly pay (£)",
	"drawSliderButtons": true,
	"highlight": true, //if you want to adjust where the highlight label goes, input top/bottom/middle for the relevant groups in the label_y column of the data file or start/middle/end to alter the text anchor in the label_anchor column
	"margin": {
		"sm": {
			"top": 140,
			"right": 20,
			"bottom": 50,
			"left": 35
		},
		"md": {
			"top": 115,
			"right": 20,
			"bottom": 50,
			"left": 35
		},
		"lg": {
			"top": 115,
			"right": 60,
			"bottom": 50,
			"left": 35
		}
	},
	"aspectRatio": {
		"sm": [16, 14],
		"md": [16, 12],
		"lg": [16, 12]
	},
	"xAxisTicks": {
		"sm": 2,
		"md": 4,
		"lg": 4
	},
	"mobileBreakpoint": 450, //if you update this, update the max-width on the @media css for the tooltip to size correctly
	"mediumBreakpoint": 600
};
