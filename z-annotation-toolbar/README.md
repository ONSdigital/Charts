# Chart Annotation System Documentation

A comprehensive library for adding annotations to D3.js charts with support for mobile-friendly alternatives and interactive annotation toolbar management.

## Table of Contents
- [Quick Start](#quick-start)
- [Core Functions](#core-functions)
- [Interactive Annotation Toolbar](#interactive-annotation-toolbar)
- [Configuration Reference](#configuration-reference)
- [Annotation Types](#annotation-types)
- [Examples](#examples)
- [Mobile Annotation System](#mobile-annotation-system)
- [CSS Classes Reference](#css-classes-reference)
- [Legacy Functions](#legacy-functions)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Basic Annotation Usage

```javascript
// Setup arrowheads (required for arrow annotations)
setupArrowhead(svg);

// Simple arrow annotation
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 100, y: 50,
  text: 'Important point',
  arrow: { lengthX: 40, lengthY: 30 }
});

// Or use the simplified version
addSimpleAnnotation(chartSvg, 'arrow', 100, 50, 'Important point');
```

### Interactive Toolbar Setup

```javascript
// Setup interactive annotation toolbar
const margin = {top: 20, right: 30, bottom: 40, left: 50};
const chart_width = 800 - margin.left - margin.right;
const chart_height = 400 - margin.top - margin.bottom;

const xScale = d3.scaleLinear().domain([0, 100]).range([0, chart_width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([chart_height, 0]);

createAnnotationToolbar(
    '#toolbar',
    d3.select('svg'),
    svg,
    {xScale: xScale, yScale: yScale},
    margin,
    chart_width,
    chart_height
);
```

## Core Functions

### `setupArrowhead(svgContainer)`
**Required setup function for arrow annotations**
- `svgContainer`: D3 SVG selection where arrowhead markers will be defined

### `addAnnotation(config)`
**Universal annotation function**
- `config`: Configuration object (see [Configuration Reference](#configuration-reference))

### `addSimpleAnnotation(svg, type, x, y, text, options?)`
**Simplified annotation function for common use cases**
- `svg`: D3 SVG selection
- `type`: Annotation type string
- `x`: X coordinate
- `y`: Y coordinate  
- `label`: Annotation text
- `options`: Optional configuration object (same structure as `addAnnotation`)

## Interactive Annotation Toolbar

The `createAnnotationToolbar` function creates an interactive toolbar that allows users to add, edit, and manage annotations on D3.js charts through a user interface.

### Function Signature

```javascript
createAnnotationToolbar(selector, wholeSvg, chartContainer, scales, margin, chart_width, chart_height)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | string | CSS selector for the container where the toolbar will be created (e.g., '#toolbar') |
| `wholeSvg` | D3 selection | The entire SVG element containing the chart |
| `chartContainer` | D3 selection | The specific SVG group or container where annotations will be rendered |
| `scales` | object | Object containing xScale and yScale functions for coordinate conversion |
| `margin` | object | Chart margins object with properties like top, right, bottom, left |
| `chart_width` | number | Width of the chart area |
| `chart_height` | number | Height of the chart area |

### Required HTML Structure

Before calling the function, ensure you have the necessary HTML elements:

```html
<!-- Toolbar container -->
<div id="toolbar"></div>

<!-- Annotation control panel -->
<div id="annotation-control-panel"></div>

<!-- Mobile footnotes container -->
<div class="mobile-annotation-footnotes-div"></div>

<!-- SVG chart -->
<svg></svg>
```

### How to Use the Interactive Toolbar

#### Adding Annotations

1. **Select annotation type**: Choose from the radio buttons in the toolbar
2. **Click "Click to place annotation with mouse"**: This activates placement mode
3. **Click on the chart**: Click where you want to place the annotation
4. **The annotation appears**: It will be automatically added to both the chart and the annotation list

#### Managing Annotations

Each annotation in the list provides several management options:

##### Reposition with Click
- Click "Reposition with click" button
- Click on a new location in the chart
- The annotation will move to the new position

##### Edit Position Manually
- Click "Edit position" to open a detailed editing form
- Modify coordinates using either:
  - **Data coordinates**: Values in your chart's data space
  - **Pixel coordinates**: Absolute pixel positions on the SVG
- Changes update in real-time as you type
- Click "Save position" to confirm changes

##### Remove Annotation
- Click "Remove annotation" to delete the annotation from both the chart and list

#### Saving Annotations

- Click "Save all annotations" at the bottom of the annotation list
- Downloads a JSON file containing all annotation data
- Filename format: `annotations-[timestamp].json`

### Loading Annotations from File

You can load previously saved annotations from a JSON file using the `loadAnnotationsFromJson()` function.

#### Basic Loading:

```javascript
// Load annotations from a saved file
loadAnnotationsFromJson('./data/my-annotations.json', chartSvg);
```

#### Mobile-Optimized Loading:

```javascript
// Load annotations with mobile optimization enabled
const isMobile = window.innerWidth < 768;
loadAnnotationsFromJson('./data/chart-annotations.json', chartSvg, isMobile);
```

### Toolbar Features

#### Interactive Editing
- Real-time coordinate conversion between data and pixel space
- Live preview of position changes
- Bidirectional coordinate editing (data ↔ pixel)

#### Persistent Management
- All annotations are tracked in the `allAnnotations` global array
- Each annotation has a unique ID for reliable management
- Complete annotation state is maintained

#### Export Functionality
- JSON export includes all annotation properties
- Can be used to restore annotations in future sessions
- Includes both display and data coordinates

## Configuration Reference

### Base Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `svg` | Object | ✓ | D3 SVG selection |
| `type` | String | ✓ | Annotation type (see [Annotation Types](#annotation-types)) |
| `x` | Number | ✓ | Primary X coordinate |
| `y` | Number | ✓ | Primary Y coordinate |
| `label` | String | | Annotation text content |

### Position Settings (`position`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | String | `'right'` | Text position: `'above'`, `'below'`, `'left'`, `'right'`, `'center'`, `'start'`, `'end'` |
| `anchor` | String | `'end'` | Arrow anchor point: `'start'`, `'end'` |
| `alignment` | String | `'above'` | Direction arrow alignment: `'above'`, `'below'`, `'left'`, `'right'` |
| `inside` | String | `'outside'` | Range text placement: `'inside'`, `'outside'` |

### Arrow Settings (`arrow`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `offsetX` | Number | `0` | Arrow start X offset |
| `offsetY` | Number | `0` | Arrow start Y offset |
| `lengthX` | Number | `0` | Arrow X length/direction |
| `lengthY` | Number | `0` | Arrow Y length/direction |
| `curve` | String | `'right'` | Curve direction: `'left'`, `'right'` |
| `direction` | String | `'right'` | Direction arrow: `'up'`, `'down'`, `'left'`, `'right'` |
| `bendDirection` | String | `'horizontal-first'` | Elbow bend: `'horizontal-first'`, `'vertical-first'` |
| `endX` | Number | | Elbow arrow end X coordinate |
| `endY` | Number | | Elbow arrow end Y coordinate |

### Line/Range Settings (`line`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | Number | `100` | Width for horizontal lines/ranges |
| `height` | Number | `100` | Height for vertical lines/ranges |
| `endX` | Number | | End X coordinate for vertical ranges |
| `endY` | Number | | End Y coordinate for horizontal ranges |
| `moveToBack` | Boolean | `false` | Move line behind other elements |

### Text Settings (`text`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `wrapWidth` | Number | `150` | Maximum text width before wrapping |
| `adjustY` | Number | `0` | Vertical text adjustment |
| `verticalAlign` | String | `'middle'` | Vertical alignment: `'top'`, `'middle'`, `'bottom'` |

### Mobile Settings (`mobile`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | Boolean | `false` | Use mobile-friendly numbered circles |
| `number` | String/Number | `1` | Circle number identifier |
| `circleOffsetX` | Number | `0` | Circle horizontal offset |
| `circleOffsetY` | Number | `0` | Circle vertical offset |

### Style Settings (`style`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | String | `'#414042'` | Arrow/line color |
| `size` | String | `'md'` | Chart size: `'sm'`, `'md'`, `'lg'` |

## Annotation Types

The system supports 8 different annotation types, available both through the interactive toolbar and programmatic API:

### `'arrow'` - Curved Arrow
Draws a curved arrow pointing to a specific location with customizable text positioning.

**Key Properties:**
- `arrow.lengthX`, `arrow.lengthY`: Arrow direction and length
- `arrow.curve`: Curve direction (`'left'` or `'right'`)
- `position.text`: Text position relative to arrow end

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 100, y: 50,
  text: 'Peak performance',
  arrow: {
    offsetX: 10,
    offsetY: -20,
    lengthX: 40,
    lengthY: 30,
    curve: 'right'
  },
  position: { text: 'above' }
});
```

### `'text'` - Standalone Text
Places text at a specific location without any connecting elements.

**Key Properties:**
- `arrow.offsetX`, `arrow.offsetY`: Text position offsets
- `position.text`: Text anchor alignment

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'text',
  x: 200, y: 100,
  text: 'Milestone reached',
  arrow: { offsetX: 10, offsetY: 5 },
  position: { text: 'left' }
});
```

### `'line-vertical'` - Vertical Reference Line
Draws a vertical line across the chart height with optional text.

**Key Properties:**
- `line.height`: Line height
- `position.text`: Text position (`'left'` or `'right'` of line)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'line-vertical',
  x: 150,
  y: 10, // Text Y position
  text: 'Target deadline',
  line: { height: 300, moveToBack: true },
  position: { text: 'right' }
});
```

### `'line-horizontal'` - Horizontal Reference Line
Draws a horizontal line across the chart width with optional text.

**Key Properties:**
- `line.width`: Line width
- `position.text`: Text position (`'above'` or `'below'` line)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'line-horizontal',
  x: 10, // Text X position
  y: 200,
  text: 'Baseline',
  line: { width: 400, moveToBack: true },
  position: { text: 'above' }
});
```

### `'range-vertical'` - Vertical Shaded Range
Creates a shaded rectangular area between two X coordinates.

**Key Properties:**
- `line.height`: Range height
- `line.endX`: End X coordinate
- `position.text`: Text alignment (`'left'` or `'right'`)
- `position.inside`: Text placement (`'inside'` or `'outside'` range)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'range-vertical',
  x: 100, // Start X
  y: 20,  // Text Y position
  text: 'Critical period',
  line: {
    height: 400,
    endX: 180 // End X
  },
  position: {
    text: 'left',
    inside: 'inside'
  }
});
```

### `'range-horizontal'` - Horizontal Shaded Range
Creates a shaded rectangular area between two Y coordinates.

**Key Properties:**
- `line.width`: Range width
- `line.endY`: End Y coordinate
- `position.text`: Text alignment (`'above'` or `'below'`)
- `position.inside`: Text placement (`'inside'` or `'outside'` range)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'range-horizontal',
  x: 20,  // Text X position
  y: 100, // Start Y
  text: 'Normal range',
  line: {
    width: 500,
    endY: 150 // End Y
  },
  position: {
    text: 'above',
    inside: 'outside'
  }
});
```

### `'direction-arrow'` - Simple Directional Arrow
Draws a simple straight arrow in cardinal directions with text.

**Key Properties:**
- `arrow.direction`: Arrow direction (`'up'`, `'down'`, `'left'`, `'right'`)
- `position.anchor`: Arrow anchor (`'start'`, `'end'`)
- `position.alignment`: Text alignment relative to arrow

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'direction-arrow',
  x: 250, y: 200,
  text: 'Increasing trend',
  arrow: { direction: 'up' },
  position: {
    anchor: 'start',
    alignment: 'right'
  },
  style: { color: '#ff6b6b' }
});
```

### `'elbow-arrow'` - L-Shaped Connector Arrow
Draws an L-shaped arrow connecting two points with customizable bend direction.

**Key Properties:**
- `arrow.endX`, `arrow.endY`: End coordinates
- `arrow.bendDirection`: Bend style (`'horizontal-first'`, `'vertical-first'`)
- `position.anchor`: Arrowhead location (`'start'`, `'end'`)
- `position.text`: Text position (`'start'`, `'center'`, `'end'`)

```javascript
addAnnotation({
  svg: chartSvg,
  type: 'elbow-arrow',
  x: 50, y: 100,
  text: 'Connected data point',
  arrow: {
    endX: 200,
    endY: 150,
    bendDirection: 'horizontal-first'
  },
  position: {
    anchor: 'end',
    text: 'center'
  }
});
```

## Examples

### Basic Arrow with Mobile Support
```javascript
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 120, y: 80,
  text: 'Significant spike in activity',
  arrow: {
    lengthX: 50,
    lengthY: -40,
    curve: 'left'
  },
  position: { text: 'above' },
  text: { wrapWidth: 120 },
  mobile: {
    enabled: true,
    number: 1,
    circleOffsetX: 10,
    circleOffsetY: -20
  }
});
```

### Complex Multi-Element Annotation
```javascript
// Background range
addAnnotation({
  svg: chartSvg,
  type: 'range-vertical',
  x: 100,
  text: 'Q4 Performance',
  line: { height: 300, endX: 200 },
  position: { text: 'left', inside: 'outside' }
});

// Reference line
addAnnotation({
  svg: chartSvg,
  type: 'line-vertical',
  x: 150,
  text: 'Target',
  line: { height: 300 },
  position: { text: 'right' }
});

// Arrow pointing to peak
addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 175, y: 60,
  text: 'Record high',
  arrow: { lengthX: 25, lengthY: 20 },
  position: { text: 'right' }
});
```

### Interactive Toolbar with Programmatic Annotations
```javascript
// Setup toolbar for user interaction
createAnnotationToolbar('#toolbar', d3.select('svg'), svg, {xScale, yScale}, margin, width, height);

// Add some initial annotations programmatically
addAnnotation({
  svg: chartSvg,
  type: 'line-horizontal',
  x: 10, y: 100,
  text: 'Baseline (click toolbar to add more)',
  line: { width: width, moveToBack: true },
  position: { text: 'above' }
});
```

### Responsive Design Pattern
```javascript
const isMobile = window.innerWidth < 768;
const chartSize = window.innerWidth < 480 ? 'sm' : 
                 window.innerWidth < 1024 ? 'md' : 'lg';

addAnnotation({
  svg: chartSvg,
  type: 'arrow',
  x: 100, y: 50,
  text: 'Key insight that needs explanation',
  arrow: { lengthX: 40, lengthY: 30 },
  text: { wrapWidth: isMobile ? 100 : 150 },
  mobile: {
    enabled: isMobile,
    number: 1,
    circleOffsetX: 15,
    circleOffsetY: -10
  },
  style: { size: chartSize }
});
```

### Custom Styling
```javascript
addAnnotation({
  svg: chartSvg,
  type: 'direction-arrow',
  x: 200, y: 150,
  text: 'Growth trajectory',
  arrow: { direction: 'up' },
  position: {
    anchor: 'end',
    alignment: 'left'
  },
  text: {
    adjustY: -5,
    verticalAlign: 'bottom',
    wrapWidth: 100
  },
  style: { color: '#2ecc71' }
});
```

## Mobile Annotation System

When `mobile.enabled` is true, annotations automatically switch to a numbered circle system:

1. **Chart Display**: Shows numbered circles instead of full text
2. **Footnote Generation**: Creates corresponding footnotes in `.mobile-annotation-footnotes-div`
3. **Responsive**: Automatically disabled on large screens (`size: 'lg'`)

### Mobile Setup Required:
```html
<div class="mobile-annotation-footnotes-div"></div>
```

```css
.mobile-annotation-circle {
  fill: #ffffff;
  stroke: #333333;
  stroke-width: 1.5;
}

.mobile-annotation-circle-text {
  font-family: sans-serif;
  font-size: 11px;
  font-weight: bold;
  fill: #333333;
}
```

## CSS Classes Reference

The annotation system uses these CSS classes:

| Class | Applied To | Purpose |
|-------|------------|---------|
| `.annotation-text` | Text elements | Style annotation text |
| `.annotation-arrow` | Arrow paths | Style arrow lines and curves |
| `.annotation-line` | Reference lines | Style horizontal/vertical lines |
| `.annotation-range` | Range rectangles | Style shaded range areas |
| `.annotation` | All annotation groups | General annotation styling |
| `.mobile-annotation-circle` | Mobile circles | Style numbered circles |
| `.mobile-annotation-circle-text` | Circle text | Style numbers in circles |
| `.edit-position-form` | Toolbar edit forms | Style inline editing forms |

## Legacy Functions

All original functions remain available for backward compatibility:

- `addAnnotationText()`
- `addAnnotationArrow()` 
- `addDirectionArrow()`
- `addElbowArrow()`
- `addAnnotationLineVertical()`
- `addAnnotationLineHorizontal()`
- `addAnnotationRangeVertical()`
- `addAnnotationRangeHorizontal()`

These maintain their original parameter structures but are now internally routed through the new consolidated system.

## Dependencies

The annotation system requires:
- **D3.js library** (v5 or higher recommended)
- **Additional functions** (for interactive toolbar):
  - `createClickDataRecorder()`: Handles mouse click recording
  - `addAnnotation()`: Renders individual annotations
  - `generateAnnotationId()`: Creates unique IDs
  - `invertScale()`: Converts pixel coordinates back to data coordinates
  - `renderAnnotations()`: Renders all annotations

### Global Variables (for toolbar)
- `allAnnotations`: Global array storing all annotation objects

## Troubleshooting

### Common Issues

#### Annotations Don't Appear
- **Check SVG selection**: Ensure `chartContainer` is correctly selected
- **Verify setup**: Call `setupArrowhead()` before adding arrow annotations
- **DOM structure**: Verify required HTML elements exist

#### Interactive Toolbar Issues
- **Click placement doesn't work**: Verify that `wholeSvg` includes the clickable area
- **Coordinate conversion errors**: Ensure scales are properly configured and passed
- **Missing annotation list**: Verify that `#annotation-control-panel` exists in your HTML

#### Mobile Annotations Not Working
- **Missing container**: Ensure `.mobile-annotation-footnotes-div` exists
- **CSS not loaded**: Verify mobile annotation styles are included
- **Size detection**: Check that responsive size detection is working correctly

#### Styling Problems
- **Text not wrapping**: Verify `text.wrapWidth` is set appropriately
- **Colors not applying**: Check that `style.color` is valid CSS color
- **Mobile circles not visible**: Ensure mobile CSS classes are properly defined

### Debugging Tips

1. **Check browser console** for JavaScript errors
2. **Verify function availability**: Ensure all required functions are in global scope
3. **Test scales manually**: Convert known data points to pixel coordinates
4. **Inspect DOM**: Use browser dev tools to examine generated SVG elements
5. **Mobile testing**: Test mobile functionality on actual devices or browser dev tools
6. **Export annotations**: Use the toolbar's export feature to examine annotation data structure

### Best Practices

1. **Initialize toolbar after chart rendering**: Ensure your chart is fully rendered before calling `createAnnotationToolbar()`
2. **Set up required HTML structure**: Create all necessary containers before initialization
3. **Test coordinate conversion**: Verify that data-to-pixel conversion works correctly
4. **Save annotation data regularly**: Use the export function to backup annotation configurations
5. **Consider performance**: Limit the number of annotations for optimal performance
6. **Mobile-first design**: Test mobile annotation experience early in development
7. **Responsive testing**: Test across different screen sizes and devices