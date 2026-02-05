config = {
	"graphicDataURL": "../example-data/time-series-ci.csv",
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
	"xDomain": "auto",
	"yDomainMax": "auto",  
	// Y-axis maximum options:
	// "auto" - Smart mode: uses data max with 10% padding if positive, or 0 if all data is negative.
	//          Automatically trims excessive whitespace below zero (>50% of range) while keeping 30% cushion above highest data point.
	// "data" - Uses exact data maximum
	// number - Custom value (e.g., 100)
	"yDomainMin": "auto",
	// Y-axis minimum options:
	// "auto" - Smart mode: uses data min with 10% padding if negative, or 0 if all data is positive.
	//          Automatically trims excessive whitespace above zero (>50% of range) while keeping 30% cushion below lowest data point.
	// "data" - Uses exact data minimum
	// number - Custom value (e.g., 0 to force zero baseline)
	// either "auto" or an array for the x domain e.g. [0,2000]
	"xAxisTickFormat": {
		"sm": "%b %y",
		"md": "%b %y",
		"lg": "%b %y"
	},
	"yAxisTickFormat":".0f",
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
