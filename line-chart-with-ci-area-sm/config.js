config = {
	"graphicDataURL": "../example-data/time-series-ci.csv",
	"colourPalette": ONSlinePalette,
	"sourceText": "Office for National Statistics ",
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
	"xDomain": [-13, 25],
	// either "auto" or an array for the x domain e.g. [0,2000] - DOES NOT WORK
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
	"xAxisTickFormat": {
		"sm": "%Y",
		"md": "%Y",
		"lg": "%Y"
	},
	"yAxisFormat": ",.0%",
	"dateFormat": "%Y",
	"yAxisLabel": "Pay Gap",
	"ciLegend": true,
	"legendIntervalText": "Likely range (95% confidence interval)",
	"legendEstimateText": "Estimated value",
	"zeroLine": "0",
	"chartEvery": {
		"sm": 1,
		"md": 2,
		"lg": 2
	},
	"aspectRatio": {
		"sm": [1.2, 1],
		"md": [1.2, 1],
		"lg": [1.2, 1]
	},
	"margin": {
		"sm": {
			"top": 70,
			"right": 15,
			"bottom": 50,
			"left": 45
		},
		"md": {
			"top": 70,
			"right": 25,
			"bottom": 50,
			"left": 45
		},
		"lg": {
			"top": 70,
			"right": 25,
			"bottom": 50,
			"left": 45
		}
	},
	"chartGap": 20,
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
	"labelSpans": {
		"enabled": true,
		timeUnit: 'year',//set to "day","month",'quarter' or 'year'
		secondaryTimeUnit: 'auto'//can be 'auto' or false to disable. set to "day","month",'quarter' or 'year' to override
	},
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
