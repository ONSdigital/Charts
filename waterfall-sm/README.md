# Waterfall chart (small multiple)

This template renders one waterfall per `group` value and lays them out using the same small-multiple pattern as the other `-sm` charts.

## Key small-multiple settings

- `chartEvery`: charts per row for `sm`, `md`, and `lg`
- `chartGap`: horizontal gap between charts in a row
- `dropYAxis`: only show y-axis labels on the leftmost chart in each row
- `xDomain`: use `"auto-all"` to keep every panel on the same x scale

## Data shape

The CSV should include:

- `group`: small-multiple panel name
- `name`: step label
- `value`: change value

Each group should begin with `Start`. Add an `End` row if you want to supply the final flag label directly; otherwise it is calculated from the steps.
