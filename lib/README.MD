# Charts lib

A comprehensive library of D3.js chart helper functions and global CSS styles designed to streamline the creation of data visualisations for ONS (Office for National Statistics) projects. This package aims to provide consistent styling and common D3.js utilities, allowing developers to focus on data binding and visual representation.

## Installation

Install the package using npm:
```bash
npm install @onsvisual/charts-lib
```

# Usage

This package is designed to be used with modern JavaScript bundlers (like Webpack, Rollup, Parcel, Vite, etc.) that support ES Modules.

## Importing JavaScript Helpers

The helpers.js file contains various utility functions for D3.js chart creation, including responsive sizing, SVG setup, data labels, axis labels, text wrapping, and advanced annotation features.

You can import individual functions from the package:
```javascript
// In your chart.js or app.js file

import { initialise, calculateChartWidth, addSvg, addDataLabels, setupArrowhead, addAnnotationText, addAnnotationArrow, addDirectionArrow, addElbowArrow, addAnnotationLineVertical, addAnnotationRangeVertical, createDelaunayOverlay } from '@onsvisual/charts-lib';
import * as d3 from 'd3'; // Assuming D3 is installed and available

// Example usage of some helper functions:

// 1. Initialise the chart size and set accessible summary
const size = initialise(null); // Pass null or initial size if needed

// 2. Calculate chart width
const chartWidth = calculateChartWidth({
  screenWidth: document.querySelector('#graphic').offsetWidth,
  chartEvery: 1,
  chartMargin: { left: 50, right: 20 }
});

// 3. Add an SVG container
const svgParent = d3.select('#graphic');
const svg = addSvg({
  svgParent: svgParent,
  chartWidth: chartWidth,
  height: 400,
  margin: { top: 30, right: 20, bottom: 50, left: 50 }
});

// 4. Add data labels (requires d3.format and a 'config' object, not provided in this example)
// addDataLabels({ svgContainer: svg, data: someData, chartWidth: chartWidth, xScaleFunction: yourXScale, yScaleFunction: yourYScale });

// 5. Setup arrowhead for annotations
setupArrowhead(svg);

// 6. Add an annotation arrow (example values)
addAnnotationArrow(
  svg,
  100, // xValue
  200, // yValue
  50,  // arrowOffsetX
  -50, // arrowOffsetY
  80,  // xLength
  30,  // yLength
  'right', // curveRight
  'This is an important annotation.', // thisText
  'above', // textPosition
  150, // wrapWidth
  false, // mobileText
  null, // mobileTextNumber
  null, // MobileCircleOffsetX
  null, // MobileCircleOffsetY
  size // size (from initialise function)
);
```

## Note on `config` and `d3`:
Several helper functions (e.g., initialise, addDataLabels) expect a global config object to be available, and many rely on the d3 library. Ensure d3 is installed in your project and passed into your chart files as needed, and that a config object is structured according to your project's needs (e.g., config.essential.accessibleSummary, config.essential.dataLabels.numberFormat).

## Importing Global CSS

The globalStyle.css file provides base styling for ONS visualisations, including resets, typography, and specific styles for chart elements (axes, legends, annotations, accessibility).

To include these styles in your project, import them directly. Your build tool will then process and apply them.

```javascript
// In your main application entry point (e.g., src/index.js or src/main.js)
// or directly in a component if your bundler supports it.

import '@onsvisual/charts-lib/global.css';

// Your application's JavaScript code continues here.
```
    
