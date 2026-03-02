config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSlinePalette,
	"drawLegend": false,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
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
	"yDomainMin": 0, // "auto" (smart zero baseline), "data" (exact min), or numeric value
	"yDomainMax": "auto", // "auto" (smart zero baseline), "data" (exact max), or numeric value
	"freeYAxisScales": true, // If true, each dropdown option gets independent y-axis scaling
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
		"sm": [3, 2],
		"md": [3, 2],
		"lg": [3, 2]
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
	"addFirstDate": true,
	"addFinalDate": true,
	"labelSpans": {
		"enabled": true,
		timeUnit:"year",//set to "day","month",'quarter' or 'year'
		"secondaryTimeUnit": "auto"//can be 'auto' or false to disable. set to "day","month",'quarter' or 'year' to override
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"addEndMarkers": false,
	"addPointMarkers": false,

	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
