config = {
	"graphicDataURL": "datanumeric.csv",
	"colourPalette": ONSlinePalette,
	"drawLegend": false,
	// Direct labels (used when drawLegend=false and size != 'sm')
	// These options are passed into lib/helpers.js:createDirectLabels().
	"directLabels": {
		// Horizontal gap (px) from the series endpoint to the label anchor
		"gap": 10,
		// Horizontal gap (px) for labels that need leader lines (i.e. labels that are in a collision cluster
		// or get vertically displaced)
		"gapWithLeaderLines": 16,
		// Minimum vertical spacing (px) between adjacent labels before they are offset
		// Note: this chart previously used 0 to allow tight packing.
		"minSpacing": 0,
		// Where labels should sit:
		// - 'margin' (labels in margin, no leader lines for early-ending series)
		// - 'marginLeader' (labels in margin, with long leader lines for early-ending series)
		// - 'lastPoint' (labels at last data point of early ending series)
		"labelLocation": "lastPoint",
		// Leader lines appear only when a label is vertically displaced
		"useLeaderLines": true,
		// 'dashed' or 'solid'
		"leaderLineStyle": "dashed",
		// 'series' (match series colour) or 'mono' (single colour)
		"leaderLineColourMode": "series",
		// Used when leaderLineColourMode is 'mono'
		"leaderLineMonoColour": "#707070",
		// Geometry tuning (px)
		"leaderLineElbowOffset": 10,
		"leaderLineEndGap": 2,
		// Minimum pixels from chart edge for labels
		"minLabelOffset": 5
	},
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
	"xDomain": "auto",
	"yDomain": [0, 7],
	// either "auto" or an array for the x domain e.g. [0,2000]
	"xAxisTickFormat": {
		"sm": "%b %y",
		"md": "%b %y",
		"lg": "%b %y"
	},
	"xAxisNumberFormat": ".0f",
	"dateFormat": "%d/%m/%Y",
	"yAxisLabel": "y axis label",
	"ciLegend": true,
	"legendIntervalText": "Likely range (95% confidence interval)",
	"legendEstimateText": "Estimated value",
	"zeroLine": "0",
	"aspectRatio": {
		"sm": [1, 1],
		"md": [4, 3],
		"lg": [16, 9]
	},
	"margin": {
		"sm": {
			"top": 30,
			"right": 30,
			"bottom": 50,
			"left": 30
		},
		"md": {
			"top": 30,
			"right": 100,
			"bottom": 50,
			"left": 30
		},
		"lg": {
			"top": 30,
			"right": 150,
			"bottom": 50,
			"left": 30
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
	"labelSpans": {
		"enabled": false,
		timeUnit: 'quarter',//set to "day","month",'quarter' or 'year'
		secondaryTimeUnit: 'auto'//can be 'auto' or false to disable. set to "day","month",'quarter' or 'year' to override
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"addFirstDate": false,
	"addFinalDate": false,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
