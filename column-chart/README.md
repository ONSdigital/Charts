# Column chart

Supports `date`, numeric, and ordinal x-axis values.

If `config.dateFormat` does not parse the `date` column and the values are not numeric, the chart now keeps those values as ordinal labels on the x-axis. This supports values such as `Q1 2025` directly in `data.csv`.
