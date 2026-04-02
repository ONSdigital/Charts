# Line chart

Supports `date`, numeric, and ordinal x-axis values.

If `config.dateFormat` does not parse the `date` column and the values are not numeric, the chart now treats them as ordinal labels and spaces them evenly across the x-axis. This supports labels such as `Q1 2025` without converting them to real dates.
