config = {
	"graphicDataURL": "data.csv",
	"colourPalette": [ONScolours.oceanBlue, ONScolours.coralPink, ONScolours.grey50],
	"netChangeColours": ["#6e97ba", "#f9979d"],
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "This chart has been hidden from screen readers. The main message is summarised in the chart title and data is available to download below.",
	// options are "ascending", "descending", "auto" (to order based on whether total is ascending or descending), or "none"
	"yAxisSort": "none",
	"showXAxis": false,
	"xAxisNumberFormat": ",.0f",
	"xAxisLabel": "",
	// Options are "auto" which will set domain at extent for each group, "auto-all" which will set domain at extent for all groups, or custom domain.
	"xDomain": "auto-all",
	// Set any additional padding to the xDomain (used for auto and auto-all only) - this can be set as a consistent value across all groups (e.g. 1000), or as a percentage extra on th automatically calcualted domain (e.g. "20%")
	"xDomainPadding": "10%",
	"flagLabels": {
		"sm": {
			"start": {
				"prefix": "2023: ",
				"suffix": "",
				"format": ",.0f"
			},
			"end": {
				"prefix": "2024: ",
				"suffix": "",
				"format": ",.0f"
			}
		},
		"md": {
			"start": {
				"prefix": "2023 population: ",
				"suffix": "",
				"format": ",.0f"
			},
			"end": {
				"prefix": "2024 population: ",
				"suffix": "",
				"format": ",.0f"
			}
		},
		"lg": {
			"start": {
				"prefix": "2023 population: ",
				"suffix": "",
				"format": ",.0f"
			},
			"end": {
				"prefix": "2024 population: ",
				"suffix": "",
				"format": ",.0f"
			}
		},
	},
	// Start and end values for your legend lines E.g. 2011 --> 2021
	"legendLabels": {"min": "2023", "max": "2024"},
	// Choose which items to include in the legend, and the order that they appear
	"legendItems": ["Dec","Inc","No"],
	"legendText": ["Decrease", "Increase", "Less than 0.01% change"],
	"dataLabels": {
		"show": true,
		"prefix": "",
		"suffix": "",
		"format": ",.0f"
	},
	"showZeroLine": false,
	// toggle Net Change bar and set options
	"netChange": {
			"show": true,
			"title": "Net change: ",
			"prefix": "",
			"suffix": "",
			"format": ",.0f"	
	},
	//the threshold at which values are categorised as "little change" - this can be set as a consistent number across all groups (e.g. 1000), or as a percentage change from the start value or each group (e.g. "1%")
	"noChangeThreshold": "0.01%",
	"noChangeCustomLabel": "",
	"margin": {
		"sm": {
			"top": 40,
			"right": 30,
			"bottom": 90,
			"left": 130
		},
		"md": {
			"top": 40,
			"right": 30,
			"bottom": 90,
			"left": 200
		},
		"lg": {
			"top": 40,
			"right": 40,
			"bottom": 90,
			"left": 250
		}
	},
	"seriesHeight": {
		"sm": 45,
		"md": 40,
		"lg": 40
	},
	"xAxisTicks": {
		"sm": 5,
		"md": 5,
		"lg": 5
	},
	"legendHeight": {
		"sm": 40,
		"md": 60,
		"lg": 60
	},
	"dotSize": 6,
	"legendItemWidth": {
		"sm": 160,
		"md": 160,
		"lg": 160
	}
}

