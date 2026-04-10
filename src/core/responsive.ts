import { defaultTheme } from "../theme/theme";
import type { BreakpointKey, Breakpoints, ResponsiveValue } from "../types";

const BREAKPOINT_FALLBACK_ORDER: Record<BreakpointKey, readonly BreakpointKey[]> = {
  sm: ["sm", "md", "lg"],
  md: ["md", "sm", "lg"],
  lg: ["lg", "md", "sm"],
};

function isResponsiveMap<T>(
  value: ResponsiveValue<T>,
): value is Partial<Record<BreakpointKey, T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("sm" in value || "md" in value || "lg" in value)
  );
}

export function getBreakpointFromWidth(
  width: number,
  breakpoints: Breakpoints = defaultTheme.breakpoints,
): BreakpointKey {
  if (width < breakpoints.mobile) {
    return "sm";
  }

  if (width < breakpoints.medium) {
    return "md";
  }

  return "lg";
}

export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: BreakpointKey,
): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isResponsiveMap(value)) {
    return value;
  }

  for (const candidate of BREAKPOINT_FALLBACK_ORDER[breakpoint]) {
    const resolvedValue = value[candidate];

    if (resolvedValue !== undefined) {
      return resolvedValue;
    }
  }

  return undefined;
}

export function observeResize(
  target: HTMLElement,
  callback: (entry: {
    breakpoint: BreakpointKey;
    height: number;
    width: number;
  }) => void,
  breakpoints: Breakpoints = defaultTheme.breakpoints,
  options: {
    emitInitial?: boolean;
  } = {},
): () => void {
  const emit = (width: number, height: number) => {
    callback({
      breakpoint: getBreakpointFromWidth(width, breakpoints),
      height,
      width,
    });
  };

  if (options.emitInitial ?? true) {
    const initialRect = target.getBoundingClientRect();
    emit(initialRect.width, initialRect.height);
  }

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      emit(entry.contentRect.width, entry.contentRect.height);
    }
  });

  observer.observe(target);

  return () => observer.disconnect();
}
