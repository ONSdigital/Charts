import { describe, it, expect } from "vitest";
import {
  removeSpaces,
  diamondShape,
  getIndexedShape,
  prefixYearFormatter,
  quarterYearFormatter,
  adjustColorForContrast,
  getTextColorFromBackground,
  calculateAutoBounds,
} from "../helpers.js";

// ---------------------------------------------------------------------------
// removeSpaces
// ---------------------------------------------------------------------------
describe("removeSpaces", () => {
  it("lowercases and strips non-alphanumeric characters", () => {
    expect(removeSpaces("Hello World!")).toBe("helloworld");
  });

  it("strips spaces, hyphens, and punctuation", () => {
    expect(removeSpaces("GDP (% change)")).toBe("gdpchange");
  });

  it("leaves numbers intact", () => {
    expect(removeSpaces("Q1 2024")).toBe("q12024");
  });

  it("returns empty string for empty input", () => {
    expect(removeSpaces("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// diamondShape
// ---------------------------------------------------------------------------
describe("diamondShape", () => {
  it("returns an SVG path string", () => {
    const path = diamondShape(10);
    expect(typeof path).toBe("string");
    expect(path).toMatch(/^[\s\nMmLlZz0-9.\s-]+$/);
  });

  it("M vertex y-coord equals -(sideLength / sqrt(2))", () => {
    const side = 14;
    const expected = -(side / Math.sqrt(2));
    const path = diamondShape(side);
    const firstCoord = parseFloat(path.match(/M 0 ([-\d.]+)/)[1]);
    expect(firstCoord).toBeCloseTo(expected, 5);
  });

  it("uses default sideLength of 10", () => {
    const pathDefault = diamondShape();
    const pathExplicit = diamondShape(10);
    expect(pathDefault.trim()).toBe(pathExplicit.trim());
  });
});

// ---------------------------------------------------------------------------
// getIndexedShape
// ---------------------------------------------------------------------------
describe("getIndexedShape", () => {
  it("index 0 → filled circle", () => {
    expect(getIndexedShape(0)).toEqual({ shape: "circle", isFilled: true });
  });

  it("index 1 → filled square", () => {
    expect(getIndexedShape(1)).toEqual({ shape: "square", isFilled: true });
  });

  it("index 2 → filled diamond", () => {
    expect(getIndexedShape(2)).toEqual({ shape: "diamond", isFilled: true });
  });

  it("index 3 → unfilled circle", () => {
    expect(getIndexedShape(3)).toEqual({ shape: "circle", isFilled: false });
  });

  it("wraps around after 6 shapes (index 6 === index 0)", () => {
    expect(getIndexedShape(6)).toEqual(getIndexedShape(0));
  });

  it("wraps around after 6 shapes (index 7 === index 1)", () => {
    expect(getIndexedShape(7)).toEqual(getIndexedShape(1));
  });
});

// ---------------------------------------------------------------------------
// prefixYearFormatter
// ---------------------------------------------------------------------------
describe("prefixYearFormatter", () => {
  it("formats a date after fiscal year start as FY/YY", () => {
    // April (month 3) is after a March year-start (month 3), so FY starts this year
    const d = new Date(Date.UTC(2023, 3, 1)); // April 2023
    expect(prefixYearFormatter(d, 3, "FY")).toBe("FY2023/24");
  });

  it("formats a date before fiscal year start as previous FY", () => {
    // January (month 0) is before April year-start (month 3)
    const d = new Date(Date.UTC(2024, 0, 15)); // Jan 2024
    expect(prefixYearFormatter(d, 3, "FY")).toBe("FY2023/24");
  });

  it("supports arbitrary prefix strings", () => {
    // yearStartMonth=0 (Jan): Jan 2020 falls in FY that starts Jan 2020 → "2020/21"
    const d = new Date(Date.UTC(2020, 0, 1));
    expect(prefixYearFormatter(d, 0, "")).toBe("2020/21");
  });
});

// ---------------------------------------------------------------------------
// quarterYearFormatter
// ---------------------------------------------------------------------------
describe("quarterYearFormatter", () => {
  it("Jan (month 0) is Q1 for a calendar year start", () => {
    const d = new Date(Date.UTC(2024, 0, 15));
    expect(quarterYearFormatter(d, 0)).toBe("Q1 2024");
  });

  it("Apr (month 3) is Q2 for a calendar year start", () => {
    const d = new Date(Date.UTC(2024, 3, 1));
    expect(quarterYearFormatter(d, 0)).toBe("Q2 2024");
  });

  it("Jul (month 6) is Q3 for a calendar year start", () => {
    const d = new Date(Date.UTC(2024, 6, 1));
    expect(quarterYearFormatter(d, 0)).toBe("Q3 2024");
  });

  it("Oct (month 9) is Q4 for a calendar year start", () => {
    const d = new Date(Date.UTC(2024, 9, 1));
    expect(quarterYearFormatter(d, 0)).toBe("Q4 2024");
  });

  it("defaults to calendar year start (yearStartMonth = 0)", () => {
    const d = new Date(Date.UTC(2023, 6, 1)); // Jul
    expect(quarterYearFormatter(d)).toBe("Q3 2023");
  });

  it("Apr (month 3) is Q1 when fiscal year starts in April (month 3)", () => {
    const d = new Date(Date.UTC(2024, 3, 1));
    expect(quarterYearFormatter(d, 3)).toBe("Q1 2024");
  });
});

// ---------------------------------------------------------------------------
// adjustColorForContrast
// ---------------------------------------------------------------------------
describe("adjustColorForContrast", () => {
  it("returns input unchanged when colour already meets contrast threshold", () => {
    // Black on white has contrast > 21 — always sufficient
    const result = adjustColorForContrast("#000000", 4.5, "#ffffff");
    expect(result.toLowerCase()).toBe("#000000");
  });

  it("darkens a very light colour to meet the contrast threshold", () => {
    // #eeeeee is near-white and will not meet 4.5:1 against white
    const result = adjustColorForContrast("#eeeeee", 4.5, "#ffffff");
    expect(result).not.toBe("#eeeeee");
    // Result should be a valid hex string
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("returns original hex when input is invalid", () => {
    const result = adjustColorForContrast("not-a-color", 4.5);
    expect(result).toBe("not-a-color");
  });
});

// ---------------------------------------------------------------------------
// getTextColorFromBackground
// ---------------------------------------------------------------------------
describe("getTextColorFromBackground", () => {
  it("returns white text on a dark background", () => {
    expect(getTextColorFromBackground("#003078")).toBe("#ffffff");
  });

  it("returns dark text on a light background", () => {
    expect(getTextColorFromBackground("#ffffff")).toBe("#222");
  });

  it("returns dark text (#222) for fallback when hex is invalid", () => {
    expect(getTextColorFromBackground("invalid")).toBe("#222");
  });
});

// ---------------------------------------------------------------------------
// calculateAutoBounds
// ---------------------------------------------------------------------------
describe("calculateAutoBounds", () => {
  const data = [
    { date: "2020", value: 50, ci: 55 },
    { date: "2021", value: 80, ci: 85 },
    { date: "2022", value: 60, ci: 65 },
  ];

  it("data mode returns exact min/max across all numeric columns", () => {
    const { minY, maxY } = calculateAutoBounds(data, {
      yDomainMin: "data",
      yDomainMax: "data",
    });
    expect(minY).toBe(50);
    expect(maxY).toBe(85);
  });

  it("auto mode sets minY to 0 when data spans from near zero", () => {
    // Data starting near 0: gap from 0 to min (2) is small relative to range (0–80),
    // so auto mode keeps the zero baseline rather than trimming.
    const nearZeroData = [
      { date: "2020", value: 2, ci: 5 },
      { date: "2021", value: 40, ci: 50 },
      { date: "2022", value: 60, ci: 80 },
    ];
    const { minY } = calculateAutoBounds(nearZeroData, {
      yDomainMin: "auto",
      yDomainMax: "auto",
    });
    expect(minY).toBe(0);
  });

  it("auto mode maxY is above the data maximum", () => {
    const { maxY } = calculateAutoBounds(data, {
      yDomainMin: "auto",
      yDomainMax: "auto",
    });
    expect(maxY).toBeGreaterThanOrEqual(85);
  });

  it("accepts custom numeric bounds", () => {
    const { minY, maxY } = calculateAutoBounds(data, {
      yDomainMin: 10,
      yDomainMax: 100,
    });
    expect(minY).toBe(10);
    expect(maxY).toBe(100);
  });

  it("swaps and warns when minY >= maxY", () => {
    const { minY, maxY } = calculateAutoBounds(data, {
      yDomainMin: 100,
      yDomainMax: 10,
    });
    expect(minY).toBeLessThan(maxY);
  });

  it("auto min is below zero when data contains negatives", () => {
    const negData = [
      { date: "2020", value: -30, ci: -10 },
      { date: "2021", value: -5, ci: 0 },
    ];
    const { minY } = calculateAutoBounds(negData, {
      yDomainMin: "auto",
      yDomainMax: "auto",
    });
    expect(minY).toBeLessThan(0);
  });
});
