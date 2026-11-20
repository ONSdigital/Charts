# Horizontal bar chart

## Axis text

Set `xAxisTitle` for the title above the bars and `xAxisLabel` for the label
below the horizontal axis. These settings are independent. `bubbleLabel`
controls the heading above the context bubbles.

## Context bubble sizing

Set `bubbleScale` in `config.js` to a positive radius multiplier. The default
`1` preserves the original size; `0.6` reduces every radius to 60%, while `1.2`
increases every radius to 120%. All bubbles scale together, preserving their
relative areas.

Bubble sizes are not capped to the row spacing or column width, so overlap is
allowed. Reduce `bubbleScale` or increase `seriesHeight` if overlap is unwanted.