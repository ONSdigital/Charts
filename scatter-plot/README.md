# Scatter Plot & Bubble Chart Documentation

## Overview

Create interactive scatter plots and bubble charts using D3.js in the ONS style. The chart supports multiple data groups with different shapes, optional size scaling for bubble charts, tooltips, highlighting, and a searchable dropdown for data point selection.

## Key Features

- **Multiple Chart Types**: Scatter plot (fixed sizes) or bubble chart (variable sizes)
- **Shape Encoding**: Four different shapes for data groups (circle, square, triangle, diamond)
- **Interactive Elements**: Tooltips, point highlighting, searchable dropdown
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Screen reader support and keyboard navigation

## Data Format

Your CSV data should have the following structure:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `xvalue` | Number | Yes | X-coordinate value |
| `yvalue` | Number | Yes | Y-coordinate value |
| `group` | String | Yes | Group/category for color and shape |
| `name` | String | Yes | Point label/identifier |
| `size` | Number | No* | Size value for bubble charts |
| `highlight` | String | No | Set to 'y' to highlight point |

*Required when `sizeConfig.enabled` is `true`

## Example 1: Basic Scatter Plot

### Configuration
```javascript
const scatterConfig = {
  "graphic_data_url": "data.csv",
  "colour_palette": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"],
  "fillOpacity": 1,
  "strokeOpacity": 1,
  
  "xDomain": "auto",
  "yDomain": "auto",
  "xAxisLabel": "Income (thousands)",
  "yAxisLabel": "Life Satisfaction Score",
  "xAxisFormat": ".0f",
  "yAxisFormat": ".1f",
  
  // Disable size scaling for scatter plot
  "sizeConfig": {
    "enabled": false
  },
  
  "aspectRatio": {
    "sm": [1, 1],
    "md": [1.2, 1],
    "lg": [1.5, 1]
  },
  
  "groupLabel": "Country Type",
  "sourceText": "World Bank, 2023"
};
```

### Sample Data (scatter_data.csv)
```csv
xvalue,yvalue,group,name,highlight
45,6.2,Developed,Norway,n
52,6.8,Developed,Denmark,y
38,5.9,Developed,Finland,n
25,4.2,Developing,India,n
35,5.1,Developing,Brazil,n
42,5.8,Developing,Mexico,n
15,3.8,Low Income,Chad,n
18,4.1,Low Income,Mali,n
```

### Result
- Fixed-size points (circles, squares, triangles, diamonds)
- Different colors for each country type
- Interactive tooltips showing income and satisfaction
- Highlighted point for Denmark

## Example 2: Bubble Chart

### Configuration
```javascript
const bubbleConfig = {
  "graphic_data_url": "bubble_data.csv",
  "colour_palette": ["#206095", "#A8BD3A", "#F66068", "#27A0CC"],
  "fillOpacity": 0.75,
  "strokeOpacity": 1,
  
  "xDomain": [0, 100],
  "yDomain": [0, 85],
  "xAxisLabel": "GDP per capita (thousands USD)",
  "yAxisLabel": "Life Expectancy (years)",
  "xAxisFormat": ".0f",
  "yAxisFormat": ".0f",
  
  // Enable size scaling for bubble chart
  "sizeConfig": {
    "enabled": true,
    "minSize": 50,      // Minimum bubble size
    "maxSize": 1000,    // Maximum bubble size  
    "sizeField": "population" // CSV column for bubble size
  },
  
  "groupLabel": "Region",
  "sizeLabel": "Population (millions)",
  "sizeLabelFormat": ".1f",
  "sourceText": "World Bank, UN Population Division, 2023"
};
```

### Sample Data (bubble_data.csv)
```csv
xvalue,yvalue,group,name,population,highlight
85,82,Europe,Germany,83.2,n
95,81,Europe,Norway,5.4,n
75,79,Europe,Poland,38.0,n
65,77,Asia,China,1439.3,y
55,75,Asia,India,1380.0,n
85,79,Asia,Japan,125.8,n
45,72,Africa,South Africa,59.3,n
25,65,Africa,Nigeria,206.1,n
35,61,Africa,Kenya,53.8,n
90,78,North America,USA,331.0,n
85,82,North America,Canada,38.0,n
```

### Result
- Variable-size bubbles based on population
- Different shapes and colors for each region
- Size legend showing population scale
- Larger bubbles drawn behind smaller ones
- Interactive tooltips with GDP, life expectancy, and population

## Advanced Configuration Options

### Responsive Design
You can set different margins and different number of ticks for each axis for different screen sizes. You can also set different breakpoints. 

```javascript
"margin": {
  "sm": { "top": 30, "right": 20, "bottom": 75, "left": 50 },
  "md": { "top": 30, "right": 20, "bottom": 75, "left": 50 },
  "lg": { "top": 30, "right": 50, "bottom": 75, "left": 50 }
},
"xAxisTicks": { "sm": 4, "md": 6, "lg": 8 },
"yAxisTicks": { "sm": 4, "md": 6, "lg": 8 },
"mobileBreakpoint": 510,
"mediumBreakpoint": 600
```

### Axis Formatting Options
- `".0f"` - Integer (e.g., 42)
- `".1f"` - One decimal place (e.g., 42.5) 
- `".0%"` - Percentage (e.g., 42%)
- `"$,.0f"` - Currency with commas (e.g., $42,000)
- `".2s"` - SI prefix (e.g., 42k, 1.2M)

## Interactive Features

### Point Highlighting
Set `highlight: 'y'` in your data to:
- Add bold stroke to specific points
- Display permanent labels
- Make points more prominent

### Searchable Dropdown
- Automatically generated from data points
- Sorted alphabetically by name
- Groups points by category
- Highlights selected point with tooltip

### Tooltips
Display on hover:
- Point name
- X and Y values (formatted)
- Group/category
- Size value (for bubble charts)

Edit the tooltipConfig object of the `createDelaunayOverlay` function. 

## Shape Assignment

Groups are automatically assigned shapes in this order:
1. **Circle** - First group alphabetically
2. **Square** - Second group
3. **Triangle** - Third group  
4. **Diamond** - Fourth group

## Best Practices

### For Scatter Plots
- Use when comparing two continuous variables
- Disable size scaling (`sizeConfig.enabled: false`)
- Keep point sizes consistent for easy comparison
- Use color/shape to show categories

### For Bubble Charts
- Use when showing three variables (x, y, size)
- Enable size scaling (`sizeConfig.enabled: true`)
- Choose appropriate min/max sizes for your data range
- Consider data overlap - larger bubbles behind smaller ones
- Provide size legend for interpretation

### Data Preparation
- Ensure no missing values in required columns
- Use meaningful names for points
- Keep group names short for legend clarity
- Consider data density - too many points can cause overlap

### Accessibility
- Provide descriptive `accessibleSummary`
- Use sufficient color contrast
- Include clear axis labels and units
- Test with screen readers

## Troubleshooting

### Common Issues

**Points not appearing**: Check that `xvalue` and `yvalue` are numeric and within domain range

**Size scaling not working**: Ensure `sizeConfig.enabled: true` and `sizeField` matches CSV column name

**Dropdown empty**: Verify `name` column exists in data

**Shapes not displaying**: Check that groups are properly defined and spelled consistently

**Legend missing**: Ensure you have group data and the legend element exists in HTML

This documentation should help you implement both scatter plots and bubble charts effectively. The key difference is enabling/disabling the size scaling configuration depending on whether you want fixed-size points (scatter) or variable-size bubbles.