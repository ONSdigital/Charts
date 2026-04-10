import {
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  type Axis,
  type AxisDomain,
  type AxisScale,
} from "d3-axis";

import type { AxisOrientation } from "../../types";

export function createAxis<Domain extends AxisDomain>(options: {
  orientation: AxisOrientation;
  scale: AxisScale<Domain>;
  tickFormat?: (domainValue: Domain, index: number) => string;
  tickPadding?: number;
  tickSize?: number;
  ticks?: number;
}): Axis<Domain> {
  const factoryMap = {
    bottom: axisBottom,
    left: axisLeft,
    right: axisRight,
    top: axisTop,
  } as const;

  const axis = factoryMap[options.orientation](options.scale);

  if (options.ticks !== undefined) {
    axis.ticks(options.ticks);
  }

  if (options.tickSize !== undefined) {
    axis.tickSize(options.tickSize);
  }

  if (options.tickPadding !== undefined) {
    axis.tickPadding(options.tickPadding);
  }

  if (options.tickFormat !== undefined) {
    axis.tickFormat(options.tickFormat);
  }

  return axis;
}
