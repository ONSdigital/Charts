import { defaultTheme } from "../../theme/theme";
import type { ChartTheme } from "../../types";

function getNamedColour(theme: ChartTheme, name: string): string | undefined {
  return theme.colors.tokens[name] ?? theme.colors.inline[name];
}

function toRgbChannels(colour: string): readonly [number, number, number] | null {
  const hex = colour.replace("#", "");

  if (hex.length === 3) {
    return [
      Number.parseInt(hex[0] + hex[0], 16),
      Number.parseInt(hex[1] + hex[1], 16),
      Number.parseInt(hex[2] + hex[2], 16),
    ];
  }

  if (hex.length === 6) {
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }

  return null;
}

export function resolveColourPalette(
  palette: string | readonly string[] | undefined,
  theme: ChartTheme = defaultTheme,
): readonly string[] {
  if (Array.isArray(palette)) {
    return [...palette];
  }

  if (typeof palette === "string") {
    const namedPalette = theme.colors.categorical[palette];

    if (namedPalette !== undefined) {
      return namedPalette;
    }

    const namedColour = getNamedColour(theme, palette);

    if (namedColour !== undefined) {
      return [namedColour];
    }

    return [palette];
  }

  return theme.colors.series;
}

export function getSeriesColour(
  index: number,
  palette: string | readonly string[] | undefined,
  theme: ChartTheme = defaultTheme,
): string {
  const resolvedPalette = resolveColourPalette(palette, theme);

  return resolvedPalette[index % resolvedPalette.length];
}

export function getTextColourForBackground(
  backgroundColour: string,
  theme: ChartTheme = defaultTheme,
): string {
  const channels = toRgbChannels(backgroundColour);

  if (channels === null) {
    return theme.colors.text;
  }

  const [red, green, blue] = channels;
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 140 ? theme.colors.text : theme.colors.background;
}
