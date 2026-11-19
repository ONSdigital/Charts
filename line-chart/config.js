config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSlinePalette,
	"drawLegend": "auto", // true = always show, false = never show, "auto" = show only at sm size
	// Direct labels (used when drawLegend=false and size != 'sm')
	// These options are passed into lib/helpers.js:createDirectLabels().
	"directLabels": {
		// Horizontal gap (px) from the series endpoint to the label anchor
		"gap": 10,
		// Horizontal gap (px) for labels that need leader lines (i.e. labels that are in a collision cluster
		// or get vertically displaced). Note: for 'marginLeader' early-ending series, this is ONLY applied
		// if the label is also displaced/clustered.
		"gapWithLeaderLines": 23,
		// Minimum vertical spacing (px) between adjacent labels before they are offset
		"minSpacing": 12,
		// Where labels should sit:
		// - 'margin' (labels in margin, no leader lines for early-ending series)
		// - 'marginLeader' (labels in margin, with long leader lines for early-ending series)
		// - 'lastPoint' (labels at last data point of early ending series)
		"labelLocation": "marginLeader",
		// Leader lines connect grouped/displaced labels and early-ending series in 'marginLeader'
		"useLeaderLines": true,
		// 'dashed' or 'solid'
		"leaderLineStyle": "dashed",
		// 'series' (match series colour) or 'mono' (single colour)
		"leaderLineColourMode": "series",
		// Used when leaderLineColourMode is 'mono'
		"leaderLineMonoColour": "#707070",
		// Base elbow offset (px); nearby labels get staggered elbows within the available gap
		"leaderLineElbowOffset": 10,
		"leaderLineEndGap": 2,
		// Minimum pixels from chart edge for labels (currently used by some charts)
		"minLabelOffset": 10
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
	"xAxisNumberFormat": ".0f",
	"yAxisNumberFormat": ".0f",
	"dateFormat": "%d/%m/%Y",
	"yAxisLabel": "y axis label",
	"xAxisLabel": "",
	"zeroLine": "0",
	"addEndMarkers":true, // true = always show, false = never show, "auto" = show only at sm size
	"addPointMarkers": false, // Set to true to show markers on all available data points
	"gapLineStyle": "dashed", // Style for lines over gaps: "dashed", "dotted", "solid" or "none"
	"aspectRatio": {
		"sm": [3, 2],
		"md": [3, 2],
		"lg": [3, 2]
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
	"addFirstDate": false,
	"addFinalDate": true,
	"labelSpans":{
		"enabled":true,
		timeUnit:"year",//set to "day","month",'quarter' or 'year'
		secondaryTimeUnit:"auto",//can be 'auto' or false to disable. set to "day","month",'quarter' or 'year' to override
		forceFullLastPrimaryUnit:true,//extends the last primary span when the final date lands exactly on a unit boundary
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
