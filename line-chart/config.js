config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSlinePalette,
	"textColourPalette": ONStextPalette,
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
	"yDomainMax": "auto",  //"auto" for automatic y-axis max, or a number for fixed max
	"yDomainMin": 0,
	"xAxisTickFormat": {
		"sm": "%Y",
		"md": "%Y",
		"lg": "%Y"
	},
	"xAxisNumberFormat": ".0f",
	"yAxisNumberFormat": ".0f",
	"dateFormat": "%d/%m/%Y",
	"yAxisLabel": "y axis label",
	"xAxisLabel": "",
	"zeroLine": "0",
	"addEndMarkers":true,
	"addPointMarkers": true, // Set to true to show markers on all available data points
	"gapLineStyle": "dashed", // Style for lines over gaps: "dashed", "dotted", "solid" or "none"
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 15,
			"right": 30,
			"bottom": 50,
			"left": 55
		},
		"md": {
			"top": 15,
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
			"sm": 2,
			"md": 2,
			"lg": 2
		}
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"addFirstDate": false,
	"addFinalDate": true,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
