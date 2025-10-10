config = {
	"graphic_data_url": "data.csv",
	"colourPalette": ONSlinePalette,
	"textColourPalette": ONStextPalette,
	"drawLegend": false,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screen reader text describing the chart.",
	"lineCurveType": "curveLinear", // Set the default line curve type
	// Examples of line curve types
	// "lineCurveType": "curveLinear", // Straight line segments
	// "lineCurveType": "curveStep", // Step-wise line
	// "lineCurveType": "curveStepBefore", // Step-before line
	// "lineCurveType": "curveStepAfter", // Step-after line
	// "lineCurveType": "curveBasis", // B-spline curve
	// "lineCurveType": "curveCardinal", // Cardinal spline curve
	// "lineCurveType": "curveCatmullRom" // Catmull-Rom spline curve
	// "lineCurveType": "curveMonotoneX" // Monotone spline curve

	"yDomainMax": "auto", // either "auto", "autoAll" or a value
	"yDomainMin": 0, // either "auto", "autoAll" or a value

	"xAxisTickFormat": {
		"sm": "%y",
		"md": "%y",
		"lg": "%Y"
	},
	"xAxisNumberFormat": ",.0f",
	"yAxisNumberFormat": ",.0f",
	"dateFormat": "%m/%d/%Y",
	"yAxisLabel": "y axis label",
	"xAxisLabel": "",
	"defaultOption": "option1",
	"zeroLine": "0",

	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 30,
			"right": 30,
			"bottom": 50,
			"left": 55
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
	// New tick config
	"xAxisTickMethod": "total", // "interval" or "total"
	"xAxisTickCount": { // for "total" method
		"sm": 2,
		"md": 2,
		"lg": 6
	},
	"xAxisTickInterval": { // for "interval" method
		"unit": "year", // "year", "month", "quarter", "day"
		"step": { // every x "units"
			"sm": 3,
			"md": 3,
			"lg": 3
		}
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"addFirstDate": true,
	"addFinalDate": true,
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
