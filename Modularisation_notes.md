# Modularisation

## Method 

In index.html add `type="module"` to the script tag loading the script.js file – this loads the file as a module, which then allows for static imports. No need to load helpers.js from this file. 

A separate helpers.js file is now in the lib folder, this contains functions with the export keyword which can then be imported by script.js. 

Import the functions that you need at the start of each script file, e.g. 

`import { initialise, wrap, addSvg, calculateChartWidth, addDataLabels, addChartTitleLabel, addXAxisLabel } from "../lib/helpers.js"; `

As script.js is now a module it is interpreted in strict mode. We need to fix some of the common errors in our scripts that are overlooked when not in strict mode. The most common error is using undeclared variables, which will likely throw a ReferenceError. Fix these by declaring them at the start of the script e.g. 

`let graphicData, size, svg; `


Replace any code that is covered by a function in helpers.js, e.g. 

    svg 
    .append('g') 
    .attr('transform', `translate(0, ${height})`) 
    .append('text') 
    .attr('x', chartWidth) 
    .attr('y', 35) 
    .attr('class', 'axis--label') 
    .text(config.xAxisLabel) 
    .attr('text-anchor', 'end'); 

Becomes: 

    addXAxisLabel({ 
    svgContainer: svg, 
    xPosition: chartWidth, 
    yPosition: height + 35, 
    text: config.xAxisLabel, 
    wrapWidth: chartWidth 
    }); 

## General notes

- The aim of passing an object of variables to the function is to make things readable and allows for default values – if one of the variables isn’t passed to the function it will use the default value from helpers.js instead, where one exists. 

- This modular approach to templates has been tested in all major browser + OS combinations as set out in https://www.gov.uk/service-manual/technology/designing-for-different-browsers-and-devices

## Phase 1 foundation audit

- The repo currently contains **37** top-level chart/demo directories with a `script.js`.
- **36** of those already import `../lib/helpers.js`; **chart-menu** is the only standalone explorer.
- The repeated primitives worth formalising first are:
  - scales
  - axes and grids
  - responsive resize logic
  - colour/palette application
  - legend rendering
  - annotations
- The bespoke geometry templates that should stay isolated until later abstraction phases are:
  - `population-pyramid`
  - `beeswarm`
  - `waterfall`

## Phase 1 scaffold

The root of the repo now carries the modular foundation without changing the legacy chart folders:

- `package.json`, `tsconfig*.json`, `vite.config.ts` — new root build pipeline
- `src/theme/` — default theme object, deep merge, and CSS variable generation
- `src/core/` — responsive/layout helpers plus axis, scale, and colour primitives
- `src/charts/` — chart-definition entrypoints for future migrations
- `src/audit/` — chart inventory and repeated primitive catalogue
- `src/schema/` + `schema.JSON` — expanded shared config schema
- `playground/` — lightweight Vite gallery for isolated chart rendering

## Phase 1 commands

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`

## Token strategy

- Theme data now comes from a single source: `src/theme/theme.ts`.
- `npm run sync:theme` keeps `src/styles/theme.css` aligned with the theme object so CSS custom properties stay in sync with JavaScript tokens.
- `npm run sync:schema` keeps `src/schema/chartConfigSchema.ts` aligned with the raw `schema.JSON` file so the library can import typed schema data without losing the raw JSON artifact.
- Margin presets from the existing chart estate are captured in the theme so future migrations can reuse existing spacing before chart-specific cleanup happens.

## Phase 2 schema and data pipeline

The new modular API now treats the legacy config shape as a compatibility layer around a richer top-level structure:

- `type`
- `data`
- `series`
- `axes`
- `layout`
- `theme`
- `plugins`
- `controls`
- `overrides`

`schema.JSON` now validates that unified shape while still accepting the older keys already used in this repo.

### Data input contract

The runtime data layer now supports:

- arrays of objects
- CSV strings
- D3 parsed row arrays with `.columns`
- remote `dataUrl` sources for CSV or JSON

All sources are normalised through `parseData()` into one internal dataset shape with:

- `columns`
- `rows`
- `series`
- input metadata

If a config includes `data.transform`, that hook runs against the cached normalised source dataset before every render or re-render.

### Chart lifecycle

The modular chart runtime now exposes an instance API:

- `createChart(definition, { container, config, data })`
- `chart.update(newData, newConfig)`
- `chart.render(reason)`
- `chart.destroy()`

The instance keeps both:

- `chart.sourceData` — cached normalised data before transform reapplication
- `chart.data` — current render dataset after transform

The root SVG/container lifecycle is maintained with D3 `selection.join()` so updates can reuse DOM structure instead of tearing down and rebuilding the whole chart each time.

## Phase 3 responsive runtime and accessibility

The modular runtime now resolves an active config per render from the container width instead of treating responsiveness as a separate chart type.

- New top-level config support:
  - `breakpoints.sm | md | lg`
  - `accessibility`
  - `series[].segments`
  - `overrides.postRender`
- `resolveConfigForContainer()` now deep-merges the matching breakpoint override before render/layout work runs.
- `createChart()` keeps the base source dataset cached, then rebuilds the active render dataset against the current size-specific config so breakpoint-specific series styles and segment metadata stay in sync on resize.
- `src/core/primitives/segments.ts` now exposes shared helpers for:
  - boundary resolution by index or value
  - baseline + overridden segment slicing
  - applying stroke/fill/dash styles to D3 selections
- `src/core/accessibility.ts` now joins shared accessibility DOM:
  - persistent SVG `role="img"` / `aria-label`
  - `title` and optional `desc`
  - accessible data table kept in the DOM at every breakpoint
  - visually-hidden-at-small-sizes behavior via config
  - minimum-touch-target helper for interactive SVG groups
- `src/audit/index.ts` now exports direct legacy `-sm` to base-chart pairings so later migrations can fold those directories into `breakpoints.sm` instead of preserving duplicate chart types.

### Current limitation

The repo already publishes an accessibility report artifact under `reports/a11y-report.html`, but there is not yet a reusable root-level script for running that report automatically against the new modular runtime across all breakpoints. That automation should be wired in once the first real renderer migrations land.

## Phase 4 plugins and declarative controls

The modular runtime now has an extension layer and an interaction layer instead of baking annotations, tooltips, and dropdown behavior into individual chart templates.

### Plugin runtime

- Plugins now follow a familiar lifecycle object shape:
  - `name`
  - `onInit(chart)`
  - `onRender(chart)`
  - `onUpdate(chart)`
  - `onDestroy(chart)`
- The UMD bundle already exposes `ONSCharts`, so global registration now works through `ONSCharts.register(plugin)` and `ONSCharts.unregister(pluginOrName)`.
- The ESM/root surface exports the same helpers plus the built-in:
  - `annotationPlugin`
  - `tooltipPlugin`
- Chart configs can opt into plugins with `plugins` entries as either:
  - string names such as `"tooltip"`
  - plugin config objects such as `{ name: "tooltip", options: { selector: "[data-ons-charts-tooltip]" } }`
- Built-in plugin names currently resolve without explicit global registration:
  - `tooltip`
  - `annotation`

### Annotation plugin

- A new top-level `annotations` array is now part of the config/schema contract.
- The built-in annotation plugin renders into the shared SVG `annotations` layer, which sits above plot marks and below the top-most overlay layer.
- Supported annotation types are:
  - `line`
  - `band`
  - `label`
- Value-based annotations depend on renderer-published scale state. Future migrated chart renderers should expose that via:

  `context.setPluginState("scales", { x, y, y2 })`

- Pixel-coordinate annotations also work directly through `x`, `x2`, `y`, and `y2`.

### Tooltip plugin

- The built-in tooltip plugin renders a positioned HTML overlay inside the shared chart figure wrapper.
- By default it binds to elements matching `[data-ons-charts-tooltip]`.
- Tooltip content is read from:
  - `data-ons-charts-tooltip`
  - `aria-label`
  - `title`
  in that order.

### Declarative controls

- Chart configs now support richer `controls` definitions with:
  - `type`: `dropdown`, `button-group`, or `toggle`
  - `action`: `filter`, `series-toggle`, or `config-swap`
  - `position`: `top` or `bottom`
  - `multiple`
  - structured option values for config swapping
- Controls render automatically into dedicated top/bottom slots around the chart.
- Built-in control actions behave as follows:
  - `filter` filters rows from cached `chart.sourceData`
  - `series-toggle` narrows `config.series` for the active render
  - `config-swap` rewrites a target config path such as `type` or `data.dataUrl` before the render pass
- Control changes now rerun the same internal lifecycle as chart updates, so callers do not need to wire listeners manually.

### Styling

- The generated runtime stylesheet now includes default control, table, and tooltip styles in addition to the theme CSS variables.
- Control elements also carry ONS-style class names (`ons-label`, `ons-input`, `ons-select`, `ons-btn`, `ons-btn-group`, `ons-checkbox`) so publication environments with existing design-system CSS can style them without extra chart-specific work.

## Phase 5 grid runtime and conditional config

Phase 5 adds small-multiples infrastructure on top of the standalone runtime without changing the legacy chart folders.

### Public chart entrypoints

- `createChart(definition, options)` still exists as the low-level renderer entrypoint.
- The public API now also exposes:
  - `create(container, config, options?)`
  - `grid(container, config, options?)`
- Those helpers resolve the renderer from `config.type`, so chart instances can survive declarative `config-swap` updates that change chart type.
- Chart definitions can now be managed through:
  - `registerChart(definition)`
  - `unregisterChart(nameOrDefinition)`
  - `getChartDefinition(type)`
  - `getRegisteredCharts()`

### Conditional config values

- Config values can now be functions in the TypeScript/JavaScript runtime.
- Each function receives a context object with:
  - `index`
  - `row`
  - `column`
  - `columns`
  - `panelCount`
  - `isFirst`
  - `isLast`
  - `isFirstInRow`
  - `isLastInRow`
  - `facetField`
  - `facetValue`
  - `role`
  - `breakpoint`
- This enables position-aware config such as `axes.y.visible = (ctx) => ctx.isFirstInRow`.
- Function-valued config is runtime-only and is therefore documented in TypeScript/docs but not directly representable in `schema.JSON`.

### Grid runtime

- `createGrid()` now facets one normalised source dataset via `facet.field` and manages a child chart instance per facet value.
- Grid column count is responsive through `facet.columns` and defaults to:
  - `sm: 1`
  - `md: 2`
  - `lg: 3`
- Grid-level controls render once around the grid host and then propagate updates to every child chart.
- Child charts reuse the same standalone runtime with panel-specific context instead of maintaining a separate render path.

### Shared axes and linked interactions

- Grid panels share axis domains by default for `x`, `y`, and `y2` unless the relevant axis sets `shared: false`.
- Child panels can opt out of linked interactions with `linked: false`.
- The grid owns a shared event bus, and the tooltip plugin now uses that bus to broadcast hover/highlight state across compatible panels.
- Linked tooltip state is keyed via `data-ons-charts-link-key` where renderers expose it.

### Current limitation

- The infrastructure now supports small multiples, dynamic config, and linked hover state, but the first migrated renderer will still be the point where domain inference and linked-mark conventions get exercised against real chart implementations.
