# ONS Chart Style Guide

> This document summarises all design rules from the [ONS Chart Style Guide](https://ons-design.notion.site/ONS-chart-style-guide-abc7605a97624dc2bc7f2a3e16379d82). Use it to check whether charts comply with ONS style standards.

**Note:** Some archived sections (Chart Furniture, Typography) have been superseded by the [ONS Service Manual](https://service-manual.ons.gov.uk/) but the rules remain valid for chart compliance checking.

---

## 1. Typography

### General rules
- **Font family:** Open Sans, with fallbacks: `"Open Sans, Helvetica, Arial, sans-serif"`
- **Font weights used:** 400 (regular), 600 (semi-bold), 700 (bold)
- **Default font colour:** `#222222` (Black)
- **Default/minimum font size:** 14px for most charts. 12px only in small multiples if absolutely necessary
- **Case:** Always use sentence case
- **Orientation:** All text in charts should be horizontal (no rotated labels)
- **OpenType feature:** Use stylistic set 1 (`font-feature-settings: "salt" 1`) for accessible lowercase g and uppercase i

### Typography specifications by element

| Element | Size / Line height | Weight | Hex | Colour name | Alignment |
|---------|-------------------|--------|-----|-------------|-----------|
| Title | 22/28.6px (1.3) | Bold (700) | `#222222` | Black | Left |
| Sub-title | 18/23.4px (1.3) | Semi bold (600) | `#222222` | Black | Left |
| Figure title | 18/23.4px (1.3) | Semi bold (600) | `#707071` | Grey 75 | Left |
| Source (new style) | 16/19.2px (1.2) | Regular (400) | `#707071` | Grey 75 | Left |
| Source (current/Chartbuilder) | 16/19.2px (1.2) | Bold (600) | `#222222` | Black | Left |
| X axis labels (numeric) | 14/16.8px (1.2) | Regular (400) | `#707071` | Grey 75 | Center |
| Y axis labels (numeric) | 14/16.8px (1.2) | Regular (400) | `#707071` | Grey 75 | Right |
| Y axis labels (categorical) | 14/16.8px (1.2) | Regular (400) | `#414042` | Grey 100 | Right |
| Y axis category group title | 14/16.8px (1.2) | Bold (700) | `#414042` | Grey 100 | Left |
| Top labels in split bar chart | 14/16.8px (1.2) | Semi bold (600) | `#414042` | Grey 100 | Left |
| Axis titles | 14/16.8px (1.2) | Regular (400) | `#707071` | Grey 75 | Left |
| Annotations | 14/16.8px (1.2) | Regular (400) | `#414042` | Grey 100 | Default left |
| Annotation callout number | 14/16.8px (1.2) | Semi bold (600) | `#414042` | Grey 100 | Center |
| Direct labels – line charts (categories) | 14/16.8px (1.2) | Semi bold (600) | `Data colour` | - | Left |
| Direct labels – bar charts (data) | 14/16.8px (1.2) | Semi bold (600) | `#414042 or #FFFFFF*` | Grey 100 or white* | Right |
| Legend | 14/16.8px (1.2) | Regular (400) | `#414042` | Grey 100 | Left |
| Tooltips | Follows hierarchy | Follows hierarchy | `#414042` | Grey 100 | Left |

> *Direct labels on bar charts: use white (#FFFFFF) inside dark bars, black (#414042) outside or on light bars

---

## 2. Colour

> ℹ️ These are the current ONS colours. A colour update (2.0) is in progress.

### 2.1 Categorical palette
Use to show distinct categories that are not part of a sequence. Apply colours in the order listed below.

**Rules:**
- Use colours in the order shown in the table; Grey 50 (`#A09FA0`) for 'other' categories can be used wherever needed
- Use grey to de-emphasise less important or irrelevant data
- For small multiples and split bars, use the same colour(s) in each chart unless there is a specific reason to differ
- When using these colours for text (e.g. direct labels), use the adjusted hex for sufficient contrast on white

| # | Name | Hex | RGB |
|---|------|-----|-----|
| 1 | Ocean blue | `#206095` | 32, 96, 149 |
| 2 | Spring green *(text: `#6E7E26`)* | `#A8BD3A` | 168, 189, 58 |
| 3 | Beetroot purple | `#871A5B` | 135, 26, 91 |
| 4 | Coral pink | `#F66068` | 246, 96, 104 |
| 5 | Dark leaf green | `#05341A` | 5,52,26 |
| 6 | Sky blue *(text: `#1F80A3`)* | `#27A0CC` | 39, 160, 204 |
| 7 | Night blue | `#003C57` | 0, 60, 87 |
| 8 | Mint green *(text: `#1AA590`)* | `#22D0B6` | 34, 208, 182 |
| 9 | Lavender purple | `#746CB1` | 116, 108, 177 |
| 10 | Grey 50 (other) *(text: `#8D8C8E (Grey 60)`)* | `#A09FA0` | 198, 198, 198 |

### 2.2 Grey palette (for typography and chart elements)

| Name | Hex | RGB | Use |
|------|-----|-----|-----|
| Black | `#222222` | 34, 34, 34 | Title, subtitle, stroke around highlighted data points, average or reference data |
| Grey 100 | `#414042` | 65, 64, 66 | Category labels, annotation text and arrows, legend labels |
| Grey 75 | `#707071` | 112, 112, 113 | Axis labels, source, figure number |
| Grey 60 | `#8D8C8E` | 141, 140, 142 | - |
| Grey 50 | `#A09FA0` | 160, 159, 160 | Other data |
| Grey 40 | `#B3B3B3` | 179, 179, 179 | Reference line (dashed), zero line |
| Grey 30 | `#C6C6C6` |  198, 198, 198 | De-emphasised data, range plot lines |
| Grey 20 | `#D9D9D9` | 217, 217, 217 | Gridlines and tick marks, horizontal guidelines |
| Grey 10 | `#ECECEC` | 236, 236, 236 | Range highlight |

### 2.3 Specific categorical palettes

#### Positive and negative
Use only when necessary for charts showing positive/negative values.

| Colour | Hex |
|--------|-----|
| Ocean blue | `#206095` |
| Coral pink | `#F66068` |

#### Female and male
Use lighter/darker variants when showing reference lines (e.g. comparative population pyramid).

| Colour | Hex | RGB | Notes |
|--------|-----|-----|-------|
| Female | `#6749A6` | 103, 73, 166 | Default e.g. bar chart, line chart |
| Male | `#2EA1A4` | 21,126,125 | Default e.g. bar chart, line chart |
| Female alt | `#9A86E9` | 154, 134, 233 | Lighter e.g. population pyramid with reference line |

#### Previous/current time period
Use in range plots or similar charts showing data from two time periods.

| Name | Hex | RGB |
|------|-----|-----|
| Ruby red (Red) | `#D0021B` | 208, 2, 27 |
| Highlight orange (Amber) | `#F39431` | 243, 148, 49 |
| Aqua teal (Green) | `#00A3A6` | 0, 163, 166 |
| Night blue (Complete) | `#003C57` | 0, 60, 87 |

#### RAG status (Red, Amber, Green) / traffic lights
Use exclusively for RAG status charts and tables. Night blue added for 'Completed' category.

| Name | Hex | RGB |
|------|-----|-----|
| Ruby red (Red) | `#D0021B` | 208, 2, 27 |
| Highlight orange (Amber) | `#F39431` | 243, 148, 49 |
| Aqua teal (Green) | `#00A3A6` | 0, 163, 166 |
| Night blue (Complete) | `#003C57` | 0, 60, 87 |

### 2.4 Sequential palette
Use for choropleth maps and heatmaps. Always use lighter colours for lower values, darker for higher.

**Standard (YlGnBu ColorBrewer):**

| Band | Hex | RGB | Notes |
|------|-----|-----|-------|
| Lowest | `#ffffcc` | 255, 255, 204 |  |
| - | `#a1dab4` | 161, 218, 180 |  |
| - | `#41b6c4` | 123, 204, 196 |  |
| - | `#2c7fb8` | 43, 140, 190 |  |
| Highest | `#253494` | 8, 64, 129 |  |
| No data | `#DADADA` | 218, 218, 218 | No data |

```
"varcolour": ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"]
```

**Census Atlas / dasymetric maps:**
```
"varcolour": ["#CDE594","#80C6A3","#1F9EB7","#186290","#080C54"]
```

### 2.5 Diverging palettes

Use when data has a clear order going above and below zero (or another defined midpoint).

| Use case | Palette recommendation |
|----------|----------------------|
| Explicitly positive/negative data | ColorBrewer RdBu or RdYlBu. Blue = good, red = bad |
| Growth/decline | Use orange for growth, purple for decrease (ColorBrewer PiYG) |
| Population density | ColorBrewer RdPu |
| % female to % male | Diverging scale based on the female/male categorical colours |

#### Likert scale (5 steps)

| Position | Hex | Name |
|----------|-----|------|
| Strongly agree / Very good / very easy | `#118C7B` | — |
| Agree / good / easy | `#22D0B6` | — |
| Neither agree or disagree etc | `#c6c6c6` | — |
| Disagree / bad / difficult | `#F66068` | — |
| Strongly disagree / very bad / very difficult  | `#871A5B` | — |

```javascript
goodToBad: ["#118C7B","#22D0B6","#C6C6C6","#F66068","#871A5B"]
badToGood: ["#871A5B","#F66068","#C6C6C6","#22D0B6","#118C7B"]
```

---

## 3. Chart Furniture (General Rules)

### 3.1 General
- Do **not** add borders or backgrounds to charts
- Do **not** use 3D charts — they make data harder to read and interpret

### 3.2 Gridlines

- Most charts should include gridlines to help users read the data and understand the scale
- Gridlines must be placed **behind** all other chart elements
- Most charts need only horizontal **or** vertical gridlines — not both (exception: scatter plots)
- Dashed horizontal guide-lines can be added for charts such as dot plots
- Categorical axes should **not** have tick marks

| Item | Hex | Colour name | Stroke weight | Stroke style |
|------|-----|-------------|---------------|--------------|
| Zero line | `#B3B3B3` | Grey 40 | 1.5px | Solid |
| All other gridlines | `#D9D9D9` | Grey 20 | 1px | Solid |
| Tick marks | `#D9D9D9` | Grey 20 | 1px | Solid |
| Horizontal guides (e.g. dot plots) | `#D9D9D9` | Grey 20 | 1px | Dash 2px, Gap 2px |

### 3.3 Legend

- **Position:** Above the chart, flush to the left-hand side; can extend to the right
- **Preference:** Use direct labelling where possible (e.g. line charts); use legend when direct labelling is impractical

**Legend symbols:**

| Symbol | Use | Dimensions |
|--------|-----|------------|
| Circle | Fill colour (bar, area charts) | 12px diameter |
| Line | Line charts | 20px wide, 3px stroke weight, rounded caps |
| Square | Confidence interval range fill; scatter plot square symbol | 14px |
| Squared line | Discrete data reference lines in column charts | 20px wide, 4px stroke width, squared caps |
| Scatter symbols | Replicate data point shapes from chart | Circle, square, triangle, diamond – similar sizing to circles |

### 3.4 Annotations

Annotations highlight relevant data points or contextual information (significant events, date ranges).

| Item | Hex | Colour name | Stroke weight | Style |
|------|-----|-------------|---------------|-------|
| Annotation arrow | `#414042` | Grey 100 | 1px | Curved, open arrowhead |
| Reference line* | `#B3B3B3` | Grey 40 | 2px | Dash 4px, Gap 4px |
| Range highlight** | `#ECECEC` | Grey 10 | — | Fill area |

> *Reference line: e.g. to highlight a significant date or threshold
> **Range highlight: e.g. to highlight an extended time period

**Arrow style:** Curved, with an even angle of curve; use an open arrowhead.

---

## 4. Chart-Specific Rules

The following sections detail rules specific to each chart type. All general rules (typography, colour, gridlines, legend) also apply unless otherwise stated.

### Line chart

#### Gridlines
- Y axis gridlines (and zero line if needed)
- X axis ticks only
Gridlines should follow the standard gridline format

#### Labelling

**Direct labelling**
In general, where a line chart has more than one line the lines should be labelled directly. In some exceptions a legend can be used. For example:
- where two lines finish at the same point
- in a combined bar and line chart
- where the category names are long
- on mobile, where there is less room
The following text is under review
With direct labels:
- Don't use connecting lines to link direct labels to data lines

**Axis titles**
Only use axis titles if it is not clear from the title and subtitle what the axis represents.  

#### Data

**Data lines**
3px weight, solid but can be dashed or dotted in certain cases, specifically to show predicted data.
Add symbol at the right-hand end of the line.
Round line joins and line ends
CSS: stroke-linejoin="round",  stroke-linecap="round"
Javascript/d3

```JavaScript
d3.selectAll("path").style("stroke-linejoin","round").style("stroke-linecap","round")
```


**Symbols**
Add circle symbol at the right-hand end of the line. Use different shapes if more than one category in the following order (no more than six):
- circle 8px
- square 8px
- diamond (7px square rotated 45 degrees)
- circle outline 2.5px
- square outline 2.5 px
- diamond outline 2.5px
Chart with more than six lines should be avoided, but if more lines are needed repeat these shapes in order. 
These symbols should be replicated in the legend in cases where the chart is not directly labelled.  

**Uneven/missing data points**
Only add makers to other data points if the data is uneven, i.e. time periods missing. In that case, use the following shapes, with different shapes if more than one category (use no more than three shapes):
circle 8px
square 8px
diamond 7px
Shapes should have
2.5px outline, white fill

**Text**

### Line chart with uncertainty range

####   Gridlines
- Y axis gridlines (and zero line if needed)
- X axis ticks only
Gridlines should follow the standard gridline format

#### Labelling

**Direct labelling**
In general, where a line chart has more than one line the lines should be labelled directly. In some exceptions a legend can be used. For example:
- where two lines finish at the same point
- where the category names are long
- on mobile, where there is less room
The following text is under review
With direct labels:
- Don't use connecting lines to link direct labels to data lines

**Axis titles**
Only use axis titles if it is not clear from the title and subtitle what the axis represents.  

#### Data

**Data lines**
3px weight, solid but can be dashed or dotted in certain cases, specifically to show predicted data.
Add symbol at the right-hand end of the line.
Round line joins and line ends
CSS: stroke-linejoin="round",  stroke-linecap="round"
Javascript/d3

```JavaScript
d3.selectAll("path").style("stroke-linejoin","round").style("stroke-linecap","round")
```


##### Line colour
If one series:
Night blue: #003C57
If multiple series, maximum of 3 lines: 
First category: Ocean blue  #206095
Second category: Beetroot red #871A5B
Third category: Emerald Green #118C7B

**Uncertainty band**
If one series:
Ocean blue #206096 
65% opacity (0.65)
If multiple series: 
Category colour (as line colour)
30% opacity (0.3)
Do not use multiple levels of uncertainty e.g. 50% and 90% (fan chart) unless you are showing only 1 series

**Symbols**
Add symbols at the right-hand end of the line. Use different shapes if more than one category in the following order (no more than 3):
- circle 8px
- square 8px
- diamond 10px square rotated
Symbols same colour as line
These symbols should be replicated in the legend in cases where the chart is not directly labelled.  

**Text**

### Area chart

#### Gridlines
As with line charts:
- Y axis gridlines (and zero line if needed)
- X axis ticks only
Gridlines should follow the standard gridline format.

#### Labelling
A standard legend should be used that follows the same order as the data. 
Where appropriate direct labels can be added manually instead of a legend.

#### Data
There should be no border around sections in the area chart.

**Fill opacity **
Fully opaque, otherwise it looks washed out. The chart type is more for seeing trends than specific data points.

**Gradient fill**
Do not use gradient fill unless there is a clear rationale for doing so.

### Column chart

#### Gridlines
As with line charts:
- Y-axis gridlines and zero line only
- X-axis ticks only 
Column charts should always have a zero line.

#### Spacing
Padding between bars: 

If there are too few bars to that max bar width would be exceeded, reduce the chart width to maintain both the correct gap and maximum bar widths .

#### Labelling
Column charts with a single series should not have a legend.

#### Data

##### Bars
No transparency – bars should be fully opaque.
The bars should not have rounded corners.

### Column chart with reference line
Follow styling of column chart except for following

#### Colour
Bars should be lighter colour to allow contrast with the reference line, normally #27a0CC
Reference line: stroke black #222

#### Data

##### Reference lines
Reference or average lines for discrete data should be:
- 2px stroke width 
- Stroke line join: round, stroke line end: square

### Stacked column chart

#### Gridlines
As with standard column charts:
- Y-axis gridlines and zero line only 
- X-axis ticks only 
- Column charts should always have a zero line

#### Spacing
Bar width and gap size as with a standard column chart

#### Labelling
Use a standard legend.

#### Bars
No transparency – bars should be fully opaque.
The bars should not have rounded corners.

#### Markers
Where stacks include positive and negative values, markers can be used to show a total. For marker style see the bar chart with markers template. 
If needed, markers can be joined by a line to make trends clearer. Line style: 3px, black #222

### Column and line chart

#### Gridlines
As with standard column charts:
- Y-axis gridlines and zero line only 
- Column charts should always have a zero line

#### Spacing
As with a standard column chart

#### Labelling
Use a standard legend.

#### Data

##### Bars
No transparency – bars should be fully opaque.
The bars should not have rounded corners.

##### Line (optional)
For continuous data or to make trend clearer
Standard data line, #222222 (Black)

##### Marker 
Diamond
8px square rotated 45 degrees
Round corners (round linejoin)
Stroke width: 2.5px 
Stroke colour #222222 (black)
Fill: #fff (white)

### Column chart with uncertainty range

####   Gridlines
- Y axis gridlines (and zero line if needed)
- X axis ticks only
Gridlines should follow the standard gridline format

#### Labelling

**Axis titles**
Only use axis titles if it is not clear from the title and subtitle what the axis represents.  

#### Data

**Data lines**
3px weight, solid 
Square line ends
CSS:stroke-linecap="square"

##### Line colour
If one series:
Night blue: #003C57

**Uncertainty band**
If one series:
Ocean blue #206096 
65% opacity (0.65)

**Text**

### Horizontal bar chart

#### Gridlines
All bar charts should have a zero line and standard gridlines, even if labelled directly (to aid users in scanning the bars).
X-axis labels should be at the bottom.

#### Spacing
Bars should always be evenly spaced – the text should align to the vertical centre of the bar.

#### Labelling
Column charts with a single series should not have a legend

**Direct labelling**
In most cases, horizontal bar charts should be directly labelled with the data value. 
Direct data labels should align to the end of the bar on the inside where possible, outside where not. This can be on the right end if positive value, or on the left end if negative value.
- Inside bar =  white text, no shadows
- Outside bar = black (#222222) text, no shadows

#### Bars
No transparency – bars should be fully opaque.
The bars should not have rounded corners.

### Horizontal bar chart with reference markers
Follows the bar chart styling with the following variations

#### Legend
Standard legend circle (12px) for the bars
Legend diamond for the reference category (same formatting as used in the chart)

#### Marker
Outlined diamond 8px
Outline: stroke-width: 2.5px; stroke line-join: round, colour: black #222
Fill: white #fff

#### Colour
Bar fill #27A0CC

#### Text

#### Other

### Clustered horizontal bar chart

#### Gridlines
All bar charts should have a zero line and standard gridlines, even if labelled directly (to aid users in scanning the bars).

#### Spacing
Bar should always be evenly spaced

#### Labelling

**Direct labelling**
For two groups, horizontal bar charts should be directly labelled with the data value. 
For three or more groups, there isn’t enough room for direct labelling.
Direct data labels should align to the end of the bar on the inside where possible, outside where not. This can be on the right end if positive value, or on the left end if negative value.
- Inside bar =  white text, no shadows
- Outside bar = black (#222222) text, no shadows

#### Bars
No transparency – bars should be fully opaque.
The bars should not have rounded corners.

### Stacked horizontal bar chart

#### Gridlines
Standard gridlines, placed behind the bars.
Axis labels should be at the bottom.

#### Spacing
As with a horizontal bar chart, bars should always be evenly spaced.

#### Labelling
Stacked bar charts should have a standard legend. This should be in the same order as the bars left to right.

**Direct labelling**
In most cases, stacked horizontal bar charts should not be directly labelled with the data values. An exception could be where your data has few categories and all data points. 

#### Bars
No transparency – bars should be fully opaque.
The bars should not have rounded corners.

##### Markers
Where stacks include positive and negative values, markers can be used to show a total. For marker style see the template for bar chart with markers

####

### Split bar chart

#### Gridlines
Generally they should should be directly labeled with data, in which case they do not need gridlines.
Split bar charts that have minus figures should have a zero gridline. This should sit in front of the grey background bars but behind the data bars.

#### Spacing

#### Labelling
Y-axis category labels as per standard styling (right aligned, 14px regular, Grey 100).
Top category labels should be semi bold, as specified in the typography section.

##### Direct labelling
Direct data labels should align to the end of the bar on the inside where possible, outside where not. This can be on the right end if positive value, or on the left end if negative value.
- Inside bar =  white text, no shadows
- Outside bar = black (#222222) text, no shadows

#### Colour

**Bar background**
Grey 10 #ECECEC

**Bars**
These should be in a single colour, unless there is a specific reason to assign different colours to each column.
The bars should not have rounded corners.

### Dot plot

#### Gridlines
Dot plots should have a horizontal guideline formatted as set out in Chart furniture. This helps the eye align the dots to the label.
Otherwise dot plots should follow the same formatting as the horizontal dumbbell plot (range plot). 
- X-axis gridlines only
- Zero line if needed

#### Spacing
Lines should be evenly spaced, with enough space to accommodate category labels. Category labels should be centrally aligned to each line.  
The centre of each category should be 40px apart.

#### Labelling
Use a standard legend.
Right align category labels, left align group titles if applicable.

##### Direct labelling
Direct labelling unless there's a particularly high number of data points

#### Data
Don’t change the vertical alignment of the dots, even if they are close together; the dots should be aligned otherwise it adds extra complexity.

### Range plot (dumbbell chart)

#### Gridlines
X-axis gridlines only and zero line if needed.
Gridlines should be behind the bars.
Range plots do not need horizontal guides.

#### Spacing
Lines should be evenly spaced, with enough space to accommodate category labels. Category labels should be centrally aligned to each line.  
The centre of each category should be 40px apart.

#### Labelling
Right align category labels, left align group titles if applicable.

##### Direct labelling
Use direct labelling unless there's a particularly high number of data points.
They should have a standard legend.

#### Data

### Arrow chart

#### Gridlines
Follow the same formatting as the horizontal dumbbell plot (range plot). 
- X-axis gridlines only
- Zero line if needed

#### Spacing
Lines should be evenly spaced, with enough space to accommodate category labels. Category labels should be centrally aligned to each line.  
The centre of each category should be 40px apart. 

#### Labelling
Right align category labels, left align group titles if applicable.

##### Direct labelling
Use direct labelling unless there's a particularly high number of data points.

#### Data
Open arrow head.
Default colour #206095 (Ocean blue) for positive values, #F66068 (Coral pink) for negative values, #707071 (Grey 75) and just a line for no change

### Bubble plot

#### Gridlines
Standard gridlines (both vertical and horizontal).
Axis labels where needed.

#### Labelling
Use standard legend style, but with scale of dots. 
Where data points are highlighted, 1.5px stroke outline #222222 (Black), standard annotation size and colour, but semibold.

#### Data
Default colour #27A0CC (Sky blue), 75% opacity, with stroke outline 1px fully opaque same colour (#27A0CC). Adding some transparency helps to show density of data points and the outline helps legibility.
Highlight data points, 1.5px #222222 (Black) outline.
Format data to smaller bubbles are in front of larger bubbles

#### Text
Labels for highlighted data points is standard annotation size and colour, but semibold.

### Scatter plot

#### Gridlines
Scatter plots should have x and y gridlines, and where necessary, zero lines. 
These should follow the standard formatting.

#### Labelling
Use standard legend style. 
Where data points are highlighted, 1.5px stroke outline #222222 (Black), standard annotation size and colour, but semibold.

#### Data
Scatterplots should have not more than four categories. 
Use shape as a well as colour to distinguish categories, shapes should be used in the following order:
1. Circle
1. Square
1. Triangle
1. Diamond
The data points should be fully opaque with a 1px white outline. Adding transparency would add another layer of complexity and make the categories harder to differentiate.
Highlight data points, 1.5px #222222 (Black) outline.

#### Text
Labels for highlighted data points is standard annotation size and colour, but semibold.

### Doughnut chart

#### Spacing
Doughnut hole is 50% of the overall shape.

#### Labelling
Label directly where possible, otherwise use the standard legend style.
Use connecting lines 

#### Data
1px white line in between categories.

#### Text
Text for both the category labels and the total information in the centre of a doughnut chart should have the same formatting

#### Other

### Chart/table hybrid

#### Dividing lines
- Header line 2px, #707071 (Grey 75)
- Other lines 1px, #D9D9D9 (Grey 20)

#### Labelling

##### Sparklines
Directly label sparklines if there is space (14px regular)

##### Split bars
Directly label split bars (16px regular)
Direct data labels should align to the end of the bar on the inside where possible, outside where not. This can be on the right end if positive value, or on the left end if negative value.
- Inside bar =  white text, no shadows
- Outside bar = black (#222222) text, no shadows

#### Data

##### Sparklines
- Data line #206095 (Ocean blue), stroke weight 2.5px
- End circles #414042 (Grey 100), diameter 7px
If applicable:
- Fill 20% opacity #206095 (Ocean blue)
- Baseline 1px, #707071 (Grey 75)

##### Bars
- Height 28px
- Background #E2E2E3 (Grey 10)
If applicable:
- Zero line 1px stroke weight, #B3B3B3 (Grey 40), aligned to bottom of bar chart, if applicable.

#### Text

### Heatmap

#### Spacing
3px gap in between boxes

#### Labelling
Direct labels on data where possible.
#414042 (Grey 100) or #FFFFFF (White)
Semi bold 16px/19.2px

#### Text
#414042 (Grey 100), 16px/19.2px
Column headers: Bold, centrally aligned
Row headers: Semi bold, right aligned
Data text: Semi bold, centrally aligned

### Small multiples

#### Gridlines
- Y axis gridlines (and zero line if needed)
- X axis ticks only
Gridlines should follow the standard gridline format. 
Only the left-hand charts need Y axis labels if the scales are the same for all.

#### Data

##### Data lines
2.5px stroke, solid but can be dashed or dotted in certain cases.
If using de-emphasised grey lines, these should be 2px stroke to keep focus on the selected line.

#### Labelling
Use a standard legend instead of directly labelling the categories, as there is limited space.
If labelling the final data point:
- use 14px semi bold text for label
- add 6px diameter circle to end of line 
- both same colour as line (with text colour adjustments for accessibility as necessary)

#### Text
If needed, text can go down to minimum 12px/14.4px.

#### Other
Charts should be in a logical order, such as:
- Order of the data, normally by size of the value (e.g. in the latest time period) or size of change
- Numerical order, e.g. age groups from youngest to oldest
- Order of importance/emphasis
- Scale order, e.g. Very good – Good – Neutral – Bad – Very bad
As a general rule:
- Any “Other” categories should be at the end
- Any “All” or “Total” charts should be at the start, or separate/full size
- If there are other charts in the article with the same categories, e.g. regions, try to keep the categories in the same order as the first one throughout
Ensure there is enough space between columns and rows of charts.

### Waterfall chart

#### Gridlines

#### Spacing

#### Labelling

#### Colour

#### Text

#### Other

### Slope chart
Only zero line and vertical start finish lines
Both Grey 40 2px

#### Spacing

#### Labelling

#### Colour

#### Text

#### Other

---

## 5. Summary Checklist

Use this checklist to quickly verify chart compliance:

### Typography
- [ ] Font is Open Sans (or sans-serif fallback)
- [ ] All text is horizontal (no rotated labels)
- [ ] Sentence case used throughout
- [ ] Minimum font size 14px (12px only in small multiples if necessary)
- [ ] Title: Bold 700, 22px, #222222
- [ ] Subtitle: Semi-bold 600, 18px, #222222
- [ ] Source: Regular 400, 16px, #707071
- [ ] Axis labels: Regular 400, 14px, #707071 (numeric) or #414042 (categorical)
- [ ] Annotations: Regular 400, 14px, #414042
- [ ] Legend: Regular 400, 14px, #414042

### Colour
- [ ] Colours are from the ONS palette
- [ ] Categorical colours applied in correct order
- [ ] Sequential: lighter = lower, darker = higher
- [ ] 3D effects not used
- [ ] Text on coloured backgrounds meets contrast requirements

### Chart Furniture
- [ ] No border or background on chart
- [ ] Gridlines behind all chart elements
- [ ] Zero line: `#B3B3B3`, 1.5px solid
- [ ] Other gridlines: `#D9D9D9`, 1px solid
- [ ] Categorical axes: no tick marks
- [ ] Legend above chart, left-aligned
- [ ] Legend symbol matches chart type (circle for bars/areas, line for lines)
- [ ] Annotation arrows: curved, open arrowhead, `#414042`
- [ ] Reference lines: `#B3B3B3`, 2px, dashed (4px dash, 4px gap)
