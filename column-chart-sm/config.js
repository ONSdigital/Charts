config = {
	"graphicDataURL": "data-with-total.csv",

	// ── Stacked bar options ─────────────────────────────────────────────────
	// Set to true to use stacked mode.
	// Data format must be wide: date, [cat1, cat2, ...], series
	// Set to false (or omit) for simple bars using narrow format: date, value, series
	"stacked": true,

	// Which stack column to overlay as a line+marker series (null to disable).
	// This column is excluded from the stack and drawn as a line over the bars.
	"lineSeries": "Net migration",
	"showMarkers": true, // must be true to show the line+marker overlay
	"showLine": true,
	"lineColour": ONScolours.black,

	// d3.stack offset and order
	// stackOffset: "stackOffsetNone" (zero baseline), "stackOffsetExpand" (100%), "stackOffsetDiverging"
	// stackOrder:  "stackOrderNone", "stackOrderAscending", "stackOrderDescending", "stackOrderReverse"
	"stackOffset": "stackOffsetDiverging",
	"stackOrder": "stackOrderNone",

	// ── Colours ─────────────────────────────────────────────────────────────
	// For stacked mode use a multi-colour palette (one colour per stack segment).
	// For simple (non-stacked) mode a single colour string works fine.
	"colourPalette": ONSpalette,

	"sourceText": "Instituto Nacional de Estadística",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",

	// Date/number formatting
	"dateFormat": "%Y",
	// Format of date values in data.csv. Use "%Y" for years, "%b-%y" for "Jan-20", etc.
	"xAxisTickFormat": {
		"sm": "%Y",
		"md": "%Y",
		"lg": "%Y"
	},
	"xAxisNumberFormat": ".0f",
	"yAxisTickFormat": ",.0f",
	"yAxisLabel": "British migrants",

	// Y domain: "auto" (0-baseline or full extent if negatives) or a fixed array e.g. [0, 100]
	"yDomain": "auto",

	// How many regular (non-featured) charts appear per row at each breakpoint
	"chartEvery": {
		"sm": 2,
		"md": 2,
		"lg": 4
	},

	"chartGap": 10,

	"aspectRatio": {
		"sm": [3, 2],
		"md": [3, 2],
		"lg": [1, 2]
	},

	"margin": {
		"sm": {
			"top": 40,
			"right": 20,
			"bottom": 40,
			"left": 50
		},
		"md": {
			"top": 40,
			"right": 20,
			"bottom": 40,
			"left": 50
		},
		"lg": {
			"top": 50,
			"right": 20,
			"bottom": 40,
			"left": 60
		}
	},

	"yAxisTicks": {
		"sm": 4,
		"md": 5,
		"lg": 5
	},

	// Show every Nth x-axis tick label (1 = all, 2 = every other, etc.)
	"xAxisTicksEvery": {
		"sm": 2,
		"md": 1,
		"lg": 5
	},

	"addFirstDate": false,
	"addFinalDate": true,

	// If true, only the leftmost chart in each row shows y-axis tick labels.
	"dropYAxis": true,

	// If true, each chart gets its own independent y-axis scale.
	"freeYAxisScales": false,

	"labelSpans": {
		"enabled": false,
		"timeUnit": "year",
		"secondaryTimeUnit": false,
		"yearStartMonth": 0,
		"prefix": ""
	},

	// ── Featured chart configuration ───────────────────────────────────────
	"featuredChart": {
		"series": "Total",
		"position": "left",
		"colSpan": 2,
		"rowSpan": 2,
		"independentYAxis": true
	},

	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
