import { describe, it, expect, beforeEach } from "vitest";
import * as d3 from "d3";
import { addSvg, wrap, getXAxisTicks } from "../helpers.js";

// ---------------------------------------------------------------------------
// addSvg
// ---------------------------------------------------------------------------
describe("addSvg", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("creates an SVG element with correct dimensions", () => {
    const d3Container = d3.select(container);
    const chartWidth = 400;
    const height = 300;
    const margin = { left: 40, right: 20, top: 20, bottom: 30 };

    const g = addSvg({ svgParent: d3Container, chartWidth, height, margin });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg.getAttribute("width")).toBe(
      String(chartWidth + margin.left + margin.right)
    );
    expect(svg.getAttribute("height")).toBe(String(height));
  });

  it("applies chart class to SVG", () => {
    const d3Container = d3.select(container);
    addSvg({
      svgParent: d3Container,
      chartWidth: 200,
      height: 150,
      margin: { left: 30, right: 10, top: 10, bottom: 20 },
    });

    const svg = container.querySelector("svg");
    expect(svg.classList.contains("chart")).toBe(true);
  });

  it("returns a g element transformed by margin", () => {
    const d3Container = d3.select(container);
    const margin = { left: 50, right: 10, top: 25, bottom: 30 };
    const g = addSvg({
      svgParent: d3Container,
      chartWidth: 300,
      height: 200,
      margin,
    });

    const transform = g.attr("transform");
    expect(transform).toBe(`translate(${margin.left},${margin.top})`);
  });

  it("returns a D3 selection of the g element", () => {
    const d3Container = d3.select(container);
    const g = addSvg({
      svgParent: d3Container,
      chartWidth: 200,
      height: 150,
      margin: { left: 20, right: 10, top: 10, bottom: 20 },
    });

    // Check if it's a D3 selection
    expect(typeof g.attr).toBe("function");
    expect(typeof g.append).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// wrap
// ---------------------------------------------------------------------------
describe("wrap", () => {
  let svg;
  let textGroup;

  beforeEach(() => {
    // Create a container with SVG and text element
    const container = document.createElement("div");
    document.body.appendChild(container);
    svg = d3
      .select(container)
      .append("svg")
      .attr("width", 400)
      .attr("height", 300);
    textGroup = svg.append("g");
  });

  it("wraps long text into multiple tspans", () => {
    const text = textGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text("This is a long sentence that should wrap");

    wrap(d3.selectAll("text"), 100);

    const tspans = text.selectAll("tspan");
    expect(tspans.size()).toBeGreaterThan(1);
  });

  it("preserves text content across tspans", () => {
    const text = textGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .text("This is a long sentence that should wrap");

    wrap(d3.selectAll("text"), 100);

    const tspanTexts = [];
    text.selectAll("tspan").each(function () {
      tspanTexts.push(d3.select(this).text());
    });

    const combined = tspanTexts.join(" ");
    expect(combined).toBe("This is a long sentence that should wrap");
  });

  it("sets x coordinate on tspans", () => {
    const xValue = 20;
    const text = textGroup
      .append("text")
      .attr("x", xValue)
      .attr("y", 0)
      .text("This is a long sentence that should wrap");

    wrap(d3.selectAll("text"), 50);

    text.selectAll("tspan").each(function (_, i) {
      if (i === 0) {
        // First tspan should have the original x
        expect(d3.select(this).attr("x")).toBe(String(xValue));
      } else {
        // Subsequent tspans should have dy attribute
        expect(d3.select(this).attr("dy")).toBeTruthy();
      }
    });
  });

  it("adjusts y position based on number of lines", () => {
    const originalY = 50;
    const text = textGroup
      .append("text")
      .attr("x", 0)
      .attr("y", originalY)
      .text("This is a long sentence that should wrap into multiple lines");

    wrap(d3.selectAll("text"), 50);

    const finalY = parseFloat(text.attr("y"));
    expect(finalY).toBeLessThan(originalY); // Should be adjusted upward
  });
});

// ---------------------------------------------------------------------------
// getXAxisTicks
// ---------------------------------------------------------------------------
describe("getXAxisTicks", () => {
  describe("date axis", () => {
    it("generates ticks using total method", () => {
      const data = [
        { date: new Date("2020-01-01") },
        { date: new Date("2020-06-01") },
        { date: new Date("2021-01-01") },
      ];
      const config = { xAxisTickMethod: "total", xAxisTickCount: { sm: 5 } };

      const ticks = getXAxisTicks({
        data,
        xDataType: "date",
        size: "sm",
        config,
      });

      expect(Array.isArray(ticks)).toBe(true);
      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toEqual(data[0].date);
      expect(ticks[ticks.length - 1]).toEqual(data[data.length - 1].date);
    });

    it("generates yearly interval ticks", () => {
      const data = [
        { date: new Date("2020-01-01") },
        { date: new Date("2021-01-01") },
        { date: new Date("2022-01-01") },
        { date: new Date("2023-01-01") },
      ];
      const config = {
        xAxisTickMethod: "interval",
        xAxisTickInterval: { unit: "year", step: 1 },
      };

      const ticks = getXAxisTicks({
        data,
        xDataType: "date",
        size: "sm",
        config,
      });

      expect(ticks.length).toBeGreaterThanOrEqual(4);
      // Should have ticks at year boundaries
      expect(ticks.some((t) => t.getUTCFullYear() === 2020)).toBe(true);
      expect(ticks.some((t) => t.getUTCFullYear() === 2023)).toBe(true);
    });

    it("adds start/end dates when config requests", () => {
      const startDate = new Date("2020-03-15");
      const endDate = new Date("2023-09-20");
      const data = [{ date: startDate }, { date: endDate }];
      const config = {
        xAxisTickMethod: "interval",
        xAxisTickInterval: { unit: "year", step: 1 },
        addFirstDate: true,
        addFinalDate: true,
      };

      const ticks = getXAxisTicks({
        data,
        xDataType: "date",
        size: "sm",
        config,
      });

      expect(ticks[0].getTime()).toBe(startDate.getTime());
      expect(ticks[ticks.length - 1].getTime()).toBe(endDate.getTime());
    });

    it("generates monthly interval ticks", () => {
      const data = [
        { date: new Date("2020-01-01") },
        { date: new Date("2020-12-01") },
      ];
      const config = {
        xAxisTickMethod: "interval",
        xAxisTickInterval: { unit: "month", step: 3 },
      };

      const ticks = getXAxisTicks({
        data,
        xDataType: "date",
        size: "sm",
        config,
      });

      expect(ticks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("numeric axis", () => {
    it("generates ticks using total method", () => {
      const data = [
        { date: 0 },
        { date: 50 },
        { date: 100 },
      ];
      const config = { xAxisTickMethod: "total", xAxisTickCount: { sm: 5 } };

      const ticks = getXAxisTicks({
        data,
        xDataType: "number",
        size: "sm",
        config,
      });

      expect(Array.isArray(ticks)).toBe(true);
      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks[0]).toBeLessThanOrEqual(0);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(100);
    });

    it("generates ticks using interval method", () => {
      const data = [
        { date: 10 },
        { date: 50 },
        { date: 100 },
      ];
      const config = {
        xAxisTickMethod: "interval",
        xAxisTickInterval: { unit: "number", step: 10 },
      };

      const ticks = getXAxisTicks({
        data,
        xDataType: "number",
        size: "sm",
        config,
      });

      expect(Array.isArray(ticks)).toBe(true);
      expect(ticks.length).toBeGreaterThan(0);
      // Ticks should be multiples of step (10)
      ticks.forEach((tick) => {
        expect(tick % 10).toBe(0);
      });
    });

    it("adds start/end values when config requests", () => {
      const data = [
        { date: 15 },
        { date: 95 },
      ];
      const config = {
        xAxisTickMethod: "interval",
        xAxisTickInterval: { unit: "number", step: 20 },
        addFirstDate: true,
        addFinalDate: true,
      };

      const ticks = getXAxisTicks({
        data,
        xDataType: "number",
        size: "sm",
        config,
      });

      expect(ticks[0]).toBe(15);
      expect(ticks[ticks.length - 1]).toBe(95);
    });

    it("removes duplicate ticks", () => {
      const data = [
        { date: 0 },
        { date: 0 },
        { date: 50 },
        { date: 100 },
      ];
      const config = {
        xAxisTickMethod: "interval",
        xAxisTickInterval: { unit: "number", step: 25 },
        addFirstDate: true,
      };

      const ticks = getXAxisTicks({
        data,
        xDataType: "number",
        size: "sm",
        config,
      });

      // Check for duplicates
      const uniqueTicks = new Set(ticks);
      expect(uniqueTicks.size).toBe(ticks.length);
    });
  });

  describe("default behavior", () => {
    it("uses interval method by default", () => {
      const data = [
        { date: new Date("2020-01-01") },
        { date: new Date("2022-01-01") },
      ];
      const config = {}; // No xAxisTickMethod specified

      const ticks = getXAxisTicks({
        data,
        xDataType: "date",
        size: "sm",
        config,
      });

      expect(Array.isArray(ticks)).toBe(true);
      expect(ticks.length).toBeGreaterThan(0);
    });

    it("defaults to yearly intervals", () => {
      const data = [
        { date: new Date("2020-01-01") },
        { date: new Date("2023-01-01") },
      ];
      const config = { xAxisTickMethod: "interval" }; // No interval specified

      const ticks = getXAxisTicks({
        data,
        xDataType: "date",
        size: "sm",
        config,
      });

      expect(ticks.length).toBeGreaterThan(0);
    });
  });
});
