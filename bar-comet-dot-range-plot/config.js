config = {
	"graphic_data_url": "data.csv",
	//either bar, comet, dot or range
	"chartType": "range",
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screen reader text describing the chart.",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xDomain": "auto",
	"xAxisLabel": "x axis label",
	"legendLabels": ["Label 1", "Label 2", "Label 3"],
	//works for bar, comet and range only (not dot as not in the current template)
	"dataLabels": {
		"show": true,
		"numberFormat": ".0%"
	},
	//set the first two colours of the palette according to the legendLabels below for the bar and range plot. For bar ref line, it is hardcoded in the css as line.refline to #222
	//input legend colours as they appear from left to right (increase, decrease, no change for comet charge)
	//suggested colour palette for:
	//bar: [ONScolours.oceanBlue]
	//comet: [ONScolours.oceanBlue, ONScolours.coralPink, ONScolours.grey50]
	//dot: [ONScolours.oceanBlue, ONScolours.grey50]
	//range: [ONScolours.grey50, ONScolours.oceanBlue]
	"colour_palette": [ONScolours.oceanBlue, ONScolours.skyBlue],
	//applies to comet, dot and range
	"dotsize": 6,
	//adjustable for comet legend only showing the increase/decrease/nochange
	"legendLineLength": 60,
	"legendItemWidth": 150,

	"chart_every": {
		"sm": 1,
		"md": 1,
		"lg": 2
	},
	// "aspectRatio": {
	// 	"sm": [1, 2],
	// 	"md": [1, 2],
	// 	"lg": [1, 2]
	// },
	"margin": {
		"sm": {
			"top": 30,
			"right": 20,
			"bottom": 50,
			"left": 200
		},
		"md": {
			"top": 30,
			"right": 20,
			"bottom": 50,
			"left": 200
		},
		"lg": {
			"top": 30,
			"right": 30,
			"bottom": 50,
			"left": 210
		}
	},
	"seriesHeight": {
		"sm": 30,
		"md": 30,
		"lg": 30
	},
	"xAxisTicks": {
		"sm": 2,
		"md": 2,
		"lg": 4
	},
	//for the comet plot
	"legendHeight": {
		"sm": 40,
		"md": 40,
		"lg": 40
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 },
	"chart_build": {}
};
