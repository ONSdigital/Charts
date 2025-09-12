<!-- README.md is auto-generated from README.Rmd. Do not edit directly. -->

# Charts

The official repository for all publication ready ONS charts. See our
[chart menu](https://onsvisual.github.io/Charts/chart-menu/) and
[service manual](https://service-manual.ons.gov.uk/data-visualisation)
for more guidance on the use of these charts, and of charts more
generally. This repo uses
[charts-lib](https://github.com/ONSvisual/charts-lib/) to maintain the
central lib files. If you want to change `helpers.js` or
`globalStyle.css` or other central file, do it there.

We currently maintain a separate [map templates
repository](https://github.com/ONSvisual/maptemplates).

(NOTE: This repository is still a work in progress.)

## If you want to make a change

Make a branch and name it something descriptive
e.g. feature/new-autocomplete. Once you are happy, do a pull request and
someone else will review it before it gets merged into main.

## If there’s a problem with a template

Please raise an [issue](https://github.com/ONSvisual/Charts/issues) and
the team will have a look.

## Guide to updating and placing an initial commit for a chart

-   All missing charts can be found in the issues section of the
    repository. They will have the following format, “\[descriptive
    chart name\]: Initial Commit”.

-   If this issue does not have an active branch and you would like to
    update and upload the chart please create a branch and you will be
    responsible for updating and making a pull request for the chart.

### Initial chart commit checklist

-   All initial commits of charts must must follow [JavaScript
    ES6](https://www.w3schools.com/js/js_es6.asp) standards and use [D3
    v6](https://observablehq.com/@d3/d3v6-migration-guide) or higher.
-   Before making additions to the `lib` folder please do check the [ONS
    CDN](https://github.com/ONSdigital/cdn.ons.gov.uk-vendor) as your
    addition to the lib folder may already to uploaded.

### Charts uploaded so far

| Chart.Name                                     | Preview                                                                                    | Code                                                                                                   |
|:-----------------------------------------------------|:---------|:-------|
| Area stacked                                   | [View](https://onsvisual.github.io/Charts/area-stacked/)                                   | [`</>`](https://github.com/ONSvisual/Charts/tree/main/area-stacked/)                                   |
| Area stacked sm                                | [View](https://onsvisual.github.io/Charts/area-stacked-sm/)                                | [`</>`](https://github.com/ONSvisual/Charts/tree/main/area-stacked-sm/)                                |
| Bar chart horizontal                           | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal/)                           | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal/)                           |
| Bar chart horizontal clustered                 | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-clustered/)                 | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-clustered/)                 |
| Bar chart horizontal clustered sm              | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-clustered-sm/)              | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-clustered-sm/)              |
| Bar chart horizontal grouped                   | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped/)                   | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-grouped/)                   |
| Bar chart horizontal grouped clustered         | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-grouped-clustered/)         | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-grouped-clustered/)         |
| Bar chart horizontal sm                        | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-sm/)                        | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-sm/)                        |
| Bar chart horizontal sm colour                 | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-sm-colour/)                 | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-sm-colour/)                 |
| Bar chart horizontal stacked                   | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked/)                   | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-stacked/)                   |
| Bar chart horizontal stacked clustered         | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered/)         | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-stacked-clustered/)         |
| Bar chart horizontal stacked clustered grouped | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-clustered-grouped/) | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-stacked-clustered-grouped/) |
| Bar chart horizontal stacked grouped           | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-grouped/)           | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-stacked-grouped/)           |
| Bar chart horizontal stacked sm                | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-sm/)                | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-stacked-sm/)                |
| Bar chart horizontal stacked with tooltip      | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-stacked-with-tooltip/)      | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-stacked-with-tooltip/)      |
| Bar chart horizontal with dropdown             | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-with-dropdown/)             | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-with-dropdown/)             |
| Bar chart horizontal with reference line       | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-with-reference-line/)       | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-with-reference-line/)       |
| Bar chart horizontal with reference sm         | [View](https://onsvisual.github.io/Charts/bar-chart-horizontal-with-reference-sm/)         | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-chart-horizontal-with-reference-sm/)         |
| Bar comet dot range plot                       | [View](https://onsvisual.github.io/Charts/bar-comet-dot-range-plot/)                       | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bar-comet-dot-range-plot/)                       |
| Beeswarm                                       | [View](https://onsvisual.github.io/Charts/beeswarm/)                                       | [`</>`](https://github.com/ONSvisual/Charts/tree/main/beeswarm/)                                       |
| Bubble chart animated                          | [View](https://onsvisual.github.io/Charts/bubble-chart-animated/)                          | [`</>`](https://github.com/ONSvisual/Charts/tree/main/bubble-chart-animated/)                          |
| Column chart                                   | [View](https://onsvisual.github.io/Charts/column-chart/)                                   | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart/)                                   |
| Column chart CI bands                          | [View](https://onsvisual.github.io/Charts/column-chart-ci-bands/)                          | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-ci-bands/)                          |
| Column chart clustered                         | [View](https://onsvisual.github.io/Charts/column-chart-clustered/)                         | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-clustered/)                         |
| Column chart sm                                | [View](https://onsvisual.github.io/Charts/column-chart-sm/)                                | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-sm/)                                |
| Column chart stacked                           | [View](https://onsvisual.github.io/Charts/column-chart-stacked/)                           | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-stacked/)                           |
| Column chart stacked sm                        | [View](https://onsvisual.github.io/Charts/column-chart-stacked-sm/)                        | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-stacked-sm/)                        |
| Column chart stacked with line                 | [View](https://onsvisual.github.io/Charts/column-chart-stacked-with-line/)                 | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-stacked-with-line/)                 |
| Column chart stacked with line sm              | [View](https://onsvisual.github.io/Charts/column-chart-stacked-with-line-sm/)              | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-stacked-with-line-sm/)              |
| Column chart with CI sm                        | [View](https://onsvisual.github.io/Charts/column-chart-with-ci-sm/)                        | [`</>`](https://github.com/ONSvisual/Charts/tree/main/column-chart-with-ci-sm/)                        |
| Comet clustered                                | [View](https://onsvisual.github.io/Charts/comet-clustered/)                                | [`</>`](https://github.com/ONSvisual/Charts/tree/main/comet-clustered/)                                |
| Comet plot                                     | [View](https://onsvisual.github.io/Charts/comet-plot/)                                     | [`</>`](https://github.com/ONSvisual/Charts/tree/main/comet-plot/)                                     |
| Dot plot                                       | [View](https://onsvisual.github.io/Charts/dot-plot/)                                       | [`</>`](https://github.com/ONSvisual/Charts/tree/main/dot-plot/)                                       |
| Dot plot with CI sm                            | [View](https://onsvisual.github.io/Charts/dot-plot-with-ci-sm/)                            | [`</>`](https://github.com/ONSvisual/Charts/tree/main/dot-plot-with-ci-sm/)                            |
| Doughnut                                       | [View](https://onsvisual.github.io/Charts/doughnut/)                                       | [`</>`](https://github.com/ONSvisual/Charts/tree/main/doughnut/)                                       |
| Heatmap                                        | [View](https://onsvisual.github.io/Charts/heatmap/)                                        | [`</>`](https://github.com/ONSvisual/Charts/tree/main/heatmap/)                                        |
| Heatmap per column                             | [View](https://onsvisual.github.io/Charts/heatmap-per-column/)                             | [`</>`](https://github.com/ONSvisual/Charts/tree/main/heatmap-per-column/)                             |
| Line chart                                     | [View](https://onsvisual.github.io/Charts/line-chart/)                                     | [`</>`](https://github.com/ONSvisual/Charts/tree/main/line-chart/)                                     |
| Line chart dropdown options                    | [View](https://onsvisual.github.io/Charts/line-chart-dropdown-options/)                    | [`</>`](https://github.com/ONSvisual/Charts/tree/main/line-chart-dropdown-options/)                    |
| Line chart sm                                  | [View](https://onsvisual.github.io/Charts/line-chart-sm/)                                  | [`</>`](https://github.com/ONSvisual/Charts/tree/main/line-chart-sm/)                                  |
| Line chart sm colours                          | [View](https://onsvisual.github.io/Charts/line-chart-sm-colours/)                          | [`</>`](https://github.com/ONSvisual/Charts/tree/main/line-chart-sm-colours/)                          |
| Line chart with CI area                        | [View](https://onsvisual.github.io/Charts/line-chart-with-ci-area/)                        | [`</>`](https://github.com/ONSvisual/Charts/tree/main/line-chart-with-ci-area/)                        |
| Line chart with CI area sm                     | [View](https://onsvisual.github.io/Charts/line-chart-with-ci-area-sm/)                     | [`</>`](https://github.com/ONSvisual/Charts/tree/main/line-chart-with-ci-area-sm/)                     |
| Population pyramid                             | [View](https://onsvisual.github.io/Charts/population-pyramid/)                             | [`</>`](https://github.com/ONSvisual/Charts/tree/main/population-pyramid/)                             |
| Range CI area grouped                          | [View](https://onsvisual.github.io/Charts/range-ci-area-grouped/)                          | [`</>`](https://github.com/ONSvisual/Charts/tree/main/range-ci-area-grouped/)                          |
| Range plot                                     | [View](https://onsvisual.github.io/Charts/range-plot/)                                     | [`</>`](https://github.com/ONSvisual/Charts/tree/main/range-plot/)                                     |
| Range plot sm                                  | [View](https://onsvisual.github.io/Charts/range-plot-sm/)                                  | [`</>`](https://github.com/ONSvisual/Charts/tree/main/range-plot-sm/)                                  |
| Scatter plot                                   | [View](https://onsvisual.github.io/Charts/scatter-plot/)                                   | [`</>`](https://github.com/ONSvisual/Charts/tree/main/scatter-plot/)                                   |
| Scatter plot animated                          | [View](https://onsvisual.github.io/Charts/scatter-plot-animated/)                          | [`</>`](https://github.com/ONSvisual/Charts/tree/main/scatter-plot-animated/)                          |
| Scatter plot sm                                | [View](https://onsvisual.github.io/Charts/scatter-plot-sm/)                                | [`</>`](https://github.com/ONSvisual/Charts/tree/main/scatter-plot-sm/)                                |
| Slope chart                                    | [View](https://onsvisual.github.io/Charts/slope-chart/)                                    | [`</>`](https://github.com/ONSvisual/Charts/tree/main/slope-chart/)                                    |
| Split bar chart                                | [View](https://onsvisual.github.io/Charts/split-bar-chart/)                                | [`</>`](https://github.com/ONSvisual/Charts/tree/main/split-bar-chart/)                                |
| Z annotation example                           | [View](https://onsvisual.github.io/Charts/z-annotation-example/)                           | [`</>`](https://github.com/ONSvisual/Charts/tree/main/z-annotation-example/)                           |
