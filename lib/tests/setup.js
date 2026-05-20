// Import d3 and assign to global — helpers.js expects it as a browser global, not an import
import * as d3 from "d3";

globalThis.d3 = d3;

// Polyfill SVGElement.getComputedTextLength for jsdom
// jsdom doesn't implement this SVG API for measuring text, but we can approximate it
// This affects SVGTextElement, SVGTSpanElement, and other text-based SVG elements
if (typeof SVGElement !== "undefined" && !SVGElement.prototype.getComputedTextLength) {
  SVGElement.prototype.getComputedTextLength = function () {
    const text = this.textContent || "";
    // Rough approximation: 1 character ≈ 8 pixels at default font size
    return text.length * 8;
  };
}



