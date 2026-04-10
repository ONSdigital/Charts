/* Auto-generated from schema.JSON. */
export const chartConfigSchema = ({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://onsdigital.github.io/Charts/schema.JSON",
  "title": "ONS chart configuration",
  "description": "Schema for serialisable ONS chart configs. Function-valued dynamic config entries supported by the TypeScript runtime are JavaScript-only and are not represented directly in JSON Schema.",
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "type": { "type": "string" },
    "data": { "$ref": "#/$defs/data" },
    "series": {
      "type": "array",
      "items": { "$ref": "#/$defs/seriesEntry" }
    },
    "annotations": {
      "type": "array",
      "items": { "$ref": "#/$defs/annotation" }
    },
    "axes": { "$ref": "#/$defs/axes" },
    "layout": { "$ref": "#/$defs/layout" },
    "theme": { "$ref": "#/$defs/themeOverride" },
    "plugins": {
      "type": "array",
      "items": {
        "oneOf": [
          { "type": "string" },
          { "$ref": "#/$defs/plugin" }
        ]
      }
    },
    "controls": {
      "type": "array",
      "items": { "$ref": "#/$defs/control" }
    },
    "facet": { "$ref": "#/$defs/facet" },
    "breakpoints": { "$ref": "#/$defs/breakpointOverrides" },
    "overrides": { "$ref": "#/$defs/overrides" },
    "accessibility": { "$ref": "#/$defs/accessibility" },
    "linked": { "type": "boolean" },

    "margin": { "$ref": "#/$defs/responsiveMargin" },
    "aspectRatio": { "$ref": "#/$defs/responsiveAspectRatio" },
    "smallMultiple": { "$ref": "#/$defs/smallMultiple" },
    "legend": {
      "oneOf": [
        { "$ref": "#/$defs/legend" },
        { "$ref": "#/$defs/stringArray" }
      ]
    },
    "dataLabels": { "$ref": "#/$defs/dataLabels" },
    "breakPoints": { "$ref": "#/$defs/breakPoints" },
    "colourPalette": { "$ref": "#/$defs/colourPalette" },
    "responsive": { "$ref": "#/$defs/responsive" },
    "sourceText": { "type": "string" },
    "accessibleSummary": { "type": "string" },
    "elements": { "$ref": "#/$defs/elements" },
    "chartType": { "$ref": "#/$defs/chartTypeOptions" },
    "graphicDataURL": { "type": "string" },
    "drawLegend": { "type": "boolean" },
    "xDomain": { "$ref": "#/$defs/domainValue" },
    "yDomainMin": { "$ref": "#/$defs/numericLike" },
    "yDomainMax": { "$ref": "#/$defs/numericLike" },
    "xAxisLabel": { "type": "string" },
    "yAxisLabel": { "type": "string" },
    "xAxisTicks": { "$ref": "#/$defs/responsiveNumericLike" },
    "yAxisTicks": { "$ref": "#/$defs/responsiveNumericLike" },
    "xAxisTickFormat": {
      "oneOf": [
        { "type": "string" },
        { "$ref": "#/$defs/responsiveString" }
      ]
    },
    "xAxisNumberFormat": { "type": "string" },
    "yAxisNumberFormat": { "type": "string" },
    "essential": {
      "type": "object",
      "additionalProperties": true
    },
    "optional": {
      "type": "object",
      "additionalProperties": true
    }
  },
  "$defs": {
    "numericLike": {
      "type": ["number", "string"]
    },
    "stringArray": {
      "type": "array",
      "items": { "type": "string" }
    },
    "rowObject": {
      "type": "object",
      "additionalProperties": true
    },
    "primitive": {
      "type": ["string", "number", "boolean", "null"]
    },
    "configValue": {
      "oneOf": [
        { "$ref": "#/$defs/primitive" },
        {
          "type": "array",
          "items": { "$ref": "#/$defs/configValue" }
        },
        {
          "type": "object",
          "additionalProperties": { "$ref": "#/$defs/configValue" }
        }
      ]
    },
    "aspectRatioValue": {
      "oneOf": [
        { "type": "number" },
        {
          "type": "array",
          "minItems": 2,
          "maxItems": 2,
          "items": { "type": "number" }
        }
      ]
    },
    "responsiveNumericLike": {
      "type": "object",
      "properties": {
        "sm": { "$ref": "#/$defs/numericLike" },
        "md": { "$ref": "#/$defs/numericLike" },
        "lg": { "$ref": "#/$defs/numericLike" }
      },
      "additionalProperties": false
    },
    "responsiveNumber": {
      "type": "object",
      "properties": {
        "sm": { "type": "number" },
        "md": { "type": "number" },
        "lg": { "type": "number" }
      },
      "additionalProperties": false
    },
    "responsiveString": {
      "type": "object",
      "properties": {
        "sm": { "type": "string" },
        "md": { "type": "string" },
        "lg": { "type": "string" }
      },
      "additionalProperties": false
    },
    "responsiveDimension": {
      "oneOf": [
        { "$ref": "#/$defs/numericLike" },
        { "$ref": "#/$defs/responsiveNumericLike" }
      ]
    },
    "margin": {
      "type": "object",
      "properties": {
        "top": { "type": "number" },
        "right": { "type": "number" },
        "bottom": { "type": "number" },
        "left": { "type": "number" }
      },
      "required": ["top", "right", "bottom", "left"],
      "additionalProperties": false
    },
    "responsiveMargin": {
      "oneOf": [
        { "$ref": "#/$defs/margin" },
        {
          "type": "object",
          "properties": {
            "sm": { "$ref": "#/$defs/margin" },
            "md": { "$ref": "#/$defs/margin" },
            "lg": { "$ref": "#/$defs/margin" }
          },
          "additionalProperties": {
            "oneOf": [
              { "$ref": "#/$defs/margin" },
              { "$ref": "#/$defs/numericLike" }
            ]
          }
        }
      ]
    },
    "responsiveAspectRatio": {
      "oneOf": [
        { "$ref": "#/$defs/aspectRatioValue" },
        {
          "type": "object",
          "properties": {
            "sm": { "$ref": "#/$defs/aspectRatioValue" },
            "md": { "$ref": "#/$defs/aspectRatioValue" },
            "lg": { "$ref": "#/$defs/aspectRatioValue" }
          },
          "additionalProperties": false
        }
      ]
    },
    "data": {
      "type": "object",
      "properties": {
        "dataUrl": { "type": "string" },
        "dateFormat": { "type": "string" },
        "format": {
          "type": "string",
          "enum": ["auto", "rows", "csv", "json"]
        },
        "isDateTime": { "type": "boolean" },
        "rowIdKey": { "type": "string" },
        "source": {
          "oneOf": [
            { "type": "string" },
            {
              "type": "array",
              "items": { "$ref": "#/$defs/rowObject" }
            }
          ]
        },
        "transform": {
          "description": "Runtime-only transform hook. JSON configs should omit this or use a host-specific string token.",
          "oneOf": [
            { "type": "string" },
            { "type": "object" }
          ]
        }
      },
      "additionalProperties": true
    },
    "seriesStyle": {
      "type": "object",
      "properties": {
        "className": { "type": "string" },
        "color": { "type": "string" },
        "dashArray": {
          "oneOf": [
            { "type": "string" },
            {
              "type": "array",
              "items": { "type": "number" }
            }
          ]
        },
        "dashFromIndex": { "type": "number" },
        "dashFromValue": { "$ref": "#/$defs/numericLike" },
        "fill": { "type": "string" },
        "marker": {
          "type": "string",
          "enum": ["none", "circle", "square", "diamond", "triangle"]
        },
        "markerSize": { "type": "number" },
        "opacity": { "type": "number" },
        "stroke": { "type": "string" },
        "strokeDasharray": {
          "oneOf": [
            { "type": "string" },
            {
              "type": "array",
              "items": { "type": "number" }
            }
          ]
        },
        "strokeWidth": { "type": "number" }
      },
      "additionalProperties": true
    },
    "seriesSegment": {
      "type": "object",
      "properties": {
        "from": { "$ref": "#/$defs/primitive" },
        "fromIndex": { "type": "number" },
        "id": { "type": "string" },
        "label": { "type": "string" },
        "style": { "$ref": "#/$defs/seriesStyle" },
        "to": { "$ref": "#/$defs/primitive" },
        "toIndex": { "type": "number" }
      },
      "additionalProperties": true
    },
    "annotationStyle": {
      "allOf": [
        { "$ref": "#/$defs/seriesStyle" }
      ],
      "type": "object",
      "properties": {
        "fontSize": { "type": "string" },
        "textAnchor": {
          "type": "string",
          "enum": ["start", "middle", "end"]
        }
      },
      "additionalProperties": true
    },
    "annotation": {
      "type": "object",
      "properties": {
        "axis": {
          "type": "string",
          "enum": ["x", "y", "y2"]
        },
        "className": { "type": "string" },
        "from": { "$ref": "#/$defs/primitive" },
        "id": { "type": "string" },
        "label": { "type": "string" },
        "style": { "$ref": "#/$defs/annotationStyle" },
        "to": { "$ref": "#/$defs/primitive" },
        "type": {
          "type": "string",
          "enum": ["band", "label", "line"]
        },
        "value": { "$ref": "#/$defs/primitive" },
        "x": { "$ref": "#/$defs/primitive" },
        "x2": { "$ref": "#/$defs/primitive" },
        "xAxis": {
          "type": "string",
          "enum": ["x"]
        },
        "y": { "$ref": "#/$defs/primitive" },
        "y2": { "$ref": "#/$defs/primitive" },
        "yAxis": {
          "type": "string",
          "enum": ["y", "y2"]
        }
      },
      "required": ["type"],
      "additionalProperties": true
    },
    "seriesEntry": {
      "type": "object",
      "properties": {
        "axis": {
          "type": "string",
          "enum": ["x", "y", "y2", "r"]
        },
        "id": { "type": "string" },
        "key": { "type": "string" },
        "label": { "type": "string" },
        "segments": {
          "type": "array",
          "items": { "$ref": "#/$defs/seriesSegment" }
        },
        "stack": { "type": "string" },
        "style": { "$ref": "#/$defs/seriesStyle" },
        "type": { "type": "string" },
        "valueKey": { "type": "string" },
        "xKey": { "type": "string" },
        "yKey": { "type": "string" }
      },
      "required": ["id"],
      "additionalProperties": true
    },
    "axis": {
      "type": "object",
      "properties": {
        "chartType": { "type": "string" },
        "axisLabel": { "type": "string" },
        "tickFormat": { "type": "string" },
        "ticks": { "$ref": "#/$defs/responsiveNumericLike" },
        "domain": { "$ref": "#/$defs/domainValue" },
        "shared": { "type": "boolean" },
        "showFirst": { "type": "boolean" },
        "showLast": { "type": "boolean" },
        "visible": { "type": "boolean" }
      },
      "additionalProperties": true
    },
    "axes": {
      "type": "object",
      "properties": {
        "x": { "$ref": "#/$defs/axis" },
        "y": { "$ref": "#/$defs/axis" },
        "y2": { "$ref": "#/$defs/axis" }
      },
      "additionalProperties": false
    },
    "layout": {
      "type": "object",
      "properties": {
        "aspectRatio": { "$ref": "#/$defs/responsiveAspectRatio" },
        "chartGap": { "$ref": "#/$defs/numericLike" },
        "height": { "$ref": "#/$defs/responsiveDimension" },
        "margin": { "$ref": "#/$defs/responsiveMargin" },
        "smallMultiple": { "$ref": "#/$defs/smallMultiple" },
        "transition": {
          "type": "object",
          "properties": {
            "duration": { "type": "number" },
            "enabled": { "type": "boolean" }
          },
          "additionalProperties": false
        },
        "width": { "$ref": "#/$defs/responsiveDimension" }
      },
      "additionalProperties": true
    },
    "facet": {
      "type": "object",
      "properties": {
        "field": { "type": "string" },
        "columns": {
          "oneOf": [
            { "type": "number" },
            { "$ref": "#/$defs/responsiveNumber" }
          ]
        },
        "focusValues": {
          "type": "array",
          "items": { "$ref": "#/$defs/primitive" }
        },
        "roleField": { "type": "string" }
      },
      "required": ["field"],
      "additionalProperties": true
    },
    "smallMultiple": {
      "type": "object",
      "properties": {
        "useSmallMultiple": { "type": "boolean" },
        "chartEvery": { "$ref": "#/$defs/responsiveNumericLike" },
        "chartGap": { "$ref": "#/$defs/numericLike" },
        "dropAxis": { "type": "boolean" },
        "freeAxis": { "type": "boolean" }
      },
      "additionalProperties": true
    },
    "legend": {
      "type": "object",
      "properties": {
        "showLegend": { "type": "boolean" },
        "legendLabels": {
          "oneOf": [
            { "$ref": "#/$defs/stringArray" },
            { "type": "string" }
          ]
        },
        "shape": {
          "oneOf": [
            { "type": "string" },
            { "$ref": "#/$defs/stringArray" }
          ]
        },
        "legendLineLength": { "$ref": "#/$defs/numericLike" },
        "legendItemWidth": { "$ref": "#/$defs/numericLike" },
        "includeNoChange": { "type": "boolean" },
        "ciLegend": { "type": "boolean" },
        "height": { "$ref": "#/$defs/responsiveNumericLike" },
        "position": {
          "type": "string",
          "enum": ["top", "right", "bottom", "left", "inline"]
        },
        "scaleRadius": { "$ref": "#/$defs/numericLike" }
      },
      "additionalProperties": true
    },
    "dataLabels": {
      "type": "object",
      "properties": {
        "show": { "type": "boolean" },
        "showDataLabels": { "type": "boolean" },
        "numberFormat": { "type": "string" }
      },
      "additionalProperties": true
    },
    "breakPoints": {
      "oneOf": [
        { "$ref": "#/$defs/numericLike" },
        {
          "type": "array",
          "items": { "$ref": "#/$defs/numericLike" }
        }
      ]
    },
    "colourPalette": {
      "oneOf": [
        { "type": "string" },
        { "$ref": "#/$defs/stringArray" }
      ]
    },
    "responsive": {
      "type": "object",
      "properties": {
        "mobileBreakpoint": { "type": "number" },
        "mediumBreakpoint": { "type": "number" }
      },
      "additionalProperties": false
    },
    "plugin": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "id": { "type": "string" },
        "name": { "type": "string" },
        "options": {
          "type": "object",
          "additionalProperties": true
        },
        "type": { "type": "string" }
      },
      "additionalProperties": true
    },
    "controlOption": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "description": { "type": "string" },
        "value": { "$ref": "#/$defs/configValue" }
      },
      "required": ["label", "value"],
      "additionalProperties": false
    },
    "control": {
      "type": "object",
      "properties": {
        "action": {
          "type": "string",
          "enum": ["filter", "series-toggle", "config-swap"]
        },
        "defaultValue": { "$ref": "#/$defs/configValue" },
        "field": { "type": "string" },
        "id": { "type": "string" },
        "label": { "type": "string" },
        "multiple": { "type": "boolean" },
        "options": {
          "type": "array",
          "items": { "$ref": "#/$defs/controlOption" }
        },
        "position": {
          "type": "string",
          "enum": ["top", "bottom"]
        },
        "type": {
          "type": "string",
          "enum": ["dropdown", "button-group", "toggle"]
        }
      },
      "required": ["action", "id", "type"],
      "additionalProperties": true
    },
    "breakpointOverrides": {
      "description": "Serializable breakpoint overrides. Function-valued conditional overrides are supported by the runtime API but are not expressible in JSON Schema.",
      "type": "object",
      "properties": {
        "sm": {
          "type": "object",
          "additionalProperties": true
        },
        "md": {
          "type": "object",
          "additionalProperties": true
        },
        "lg": {
          "type": "object",
          "additionalProperties": true
        }
      },
      "additionalProperties": false
    },
    "overrides": {
      "type": "object",
      "properties": {
        "breakpoints": { "$ref": "#/$defs/breakpointOverrides" },
        "postRender": {
          "description": "Runtime-only post-render hook placeholder for hosts that map string tokens to functions.",
          "oneOf": [
            { "type": "string" },
            {
              "type": "object",
              "additionalProperties": true
            }
          ]
        },
        "states": {
          "type": "object",
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "accessibilityTable": {
      "type": "object",
      "properties": {
        "caption": { "type": "string" },
        "hideAt": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["sm", "md", "lg"]
          }
        }
      },
      "additionalProperties": false
    },
    "accessibility": {
      "type": "object",
      "properties": {
        "ariaDescription": { "type": "string" },
        "ariaLabel": { "type": "string" },
        "role": { "type": "string" },
        "table": { "$ref": "#/$defs/accessibilityTable" },
        "touchTargetMinSize": { "type": "number" }
      },
      "additionalProperties": true
    },
    "elements": {
      "type": "object",
      "additionalProperties": {
        "type": ["number", "string", "boolean"]
      }
    },
    "themeOverride": {
      "type": "object",
      "properties": {
        "colors": {
          "type": "object",
          "properties": {
            "series": { "$ref": "#/$defs/stringArray" },
            "seriesText": { "$ref": "#/$defs/stringArray" },
            "grid": { "type": "string" },
            "axis": { "type": "string" },
            "text": { "type": "string" },
            "background": { "type": "string" },
            "focus": { "type": "string" },
            "noData": { "type": "string" },
            "positive": { "type": "string" },
            "negative": { "type": "string" },
            "zeroLine": { "type": "string" },
            "tokens": {
              "type": "object",
              "additionalProperties": { "type": "string" }
            },
            "inline": {
              "type": "object",
              "additionalProperties": { "type": "string" }
            },
            "categorical": {
              "type": "object",
              "additionalProperties": { "$ref": "#/$defs/stringArray" }
            },
            "sequential": {
              "type": "object",
              "additionalProperties": {
                "type": "object",
                "additionalProperties": { "$ref": "#/$defs/stringArray" }
              }
            },
            "diverging": {
              "type": "object",
              "additionalProperties": {
                "type": "object",
                "additionalProperties": { "$ref": "#/$defs/stringArray" }
              }
            }
          },
          "additionalProperties": true
        },
        "typography": {
          "type": "object",
          "properties": {
            "fontFamily": { "type": "string" },
            "fontFeatureSettings": { "type": "string" },
            "weights": {
              "type": "object",
              "additionalProperties": { "type": "number" }
            },
            "sizes": {
              "type": "object",
              "additionalProperties": { "type": "string" }
            }
          },
          "additionalProperties": true
        },
        "spacing": {
          "type": "object",
          "properties": {
            "chartGap": { "type": "number" },
            "legendGap": { "type": "number" },
            "labelOffset": { "type": "number" },
            "focusRingWidth": { "type": "string" },
            "strokeWidths": {
              "type": "object",
              "additionalProperties": { "type": "string" }
            },
            "radius": {
              "type": "object",
              "additionalProperties": { "type": "string" }
            },
            "margins": {
              "type": "object",
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        },
        "breakpoints": {
          "type": "object",
          "properties": {
            "mobile": { "type": "number" },
            "medium": { "type": "number" }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": true
    },
    "chartTypeOptions": {
      "type": "object",
      "properties": {
        "lineChart": {
          "type": "object",
          "properties": {
            "lineCurveType": { "type": "string", "default": "curveLinear" },
            "referenceCategory": { "type": "string", "default": "" },
            "interpolateGaps": { "type": "boolean", "default": true },
            "zeroLine": { "$ref": "#/$defs/numericLike" }
          },
          "additionalProperties": true
        },
        "barChart": {
          "type": "object",
          "properties": {
            "referenceLine": {
              "type": "object",
              "properties": {
                "showReferenceLine": { "type": "boolean", "default": false },
                "categoryName": { "type": "string", "default": "" }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        },
        "groupedBarChart": {
          "type": "object",
          "properties": {
            "groupOnCategory": { "type": "string", "default": "group" }
          },
          "additionalProperties": true
        },
        "stackedBarChart": {
          "type": "object",
          "properties": {
            "stackOrder": { "type": "string", "default": "stackOrderNone" },
            "stackOffset": { "type": "string", "default": "stackOffsetNone" },
            "tooltip": {
              "type": "object",
              "properties": {
                "showTooltip": { "type": "boolean", "default": false },
                "numberFormat": { "type": "string", "default": ".,0f" }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        },
        "columnChart": {
          "type": "object",
          "properties": {
            "axes": {
              "type": "object",
              "properties": {
                "x": {
                  "type": "object",
                  "properties": {
                    "showFirst": { "type": "boolean", "default": false },
                    "showLast": { "type": "boolean", "default": false }
                  },
                  "additionalProperties": true
                }
              },
              "additionalProperties": true
            }
          },
          "additionalProperties": true
        },
        "groupedColumnChart": {
          "type": "object",
          "properties": {
            "groupOnCategory": { "type": "string", "default": "group" }
          },
          "additionalProperties": true
        },
        "stackedColumnChart": {
          "type": "object",
          "properties": {
            "stackOrder": { "type": "string", "default": "stackOrderNone" },
            "stackOffset": { "type": "string", "default": "stackOffsetNone" }
          },
          "additionalProperties": true
        },
        "scatterBubbleChart": {
          "type": "object",
          "properties": {
            "scaleRadius": { "$ref": "#/$defs/numericLike" }
          },
          "additionalProperties": true
        },
        "rangeCometDot": {
          "type": "object",
          "properties": {
            "showDataLabels": { "type": "boolean" },
            "startMarker": {
              "type": "string",
              "enum": ["none", "circle", "arrowhead"]
            },
            "endMarker": {
              "type": "string",
              "enum": ["none", "circle", "arrowhead"]
            },
            "avoidOverlapping": { "type": "boolean", "default": true },
            "showConfidenceIntervals": { "type": "boolean" }
          },
          "additionalProperties": true
        }
      },
      "additionalProperties": true
    },
    "domainValue": {
      "oneOf": [
        { "type": "string" },
        {
          "type": "array",
          "items": { "$ref": "#/$defs/numericLike" }
        }
      ]
    }
  }
}
) as const;

export default chartConfigSchema;
