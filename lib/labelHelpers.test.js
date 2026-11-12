import assert from "node:assert/strict";
import test from "node:test";
import { positionDirectLabels } from "./helpers.js";

const labelsAt = (ys, height = 16) => ys.map((originalY) => ({ originalY, height }));
const layout = (labels, options = {}) => positionDirectLabels(labels, {
  chartHeight: 300,
  minSpacing: 4,
  ...options,
});

function assertSpacingAndBounds(labels, positions, chartHeight, minSpacing) {
  const sorted = labels
    .map((label, i) => ({ ...label, y: positions[i].y }))
    .sort((a, b) => a.originalY - b.originalY);
  sorted.forEach((label, i) => {
    assert.ok(label.y - label.height / 2 >= -1e-9);
    assert.ok(label.y + label.height / 2 <= chartHeight + 1e-9);
    if (i > 0) {
      const previous = sorted[i - 1];
      assert.ok(label.y - previous.y >= (label.height + previous.height) / 2 + minSpacing - 1e-9);
    }
  });
}

test("empty and isolated labels do not get leader groups", () => {
  assert.deepEqual(layout([]), []);
  assert.deepEqual(layout(labelsAt([50])), [{ y: 50, elbow: 0, isDodged: false }]);
  assert.deepEqual(layout(labelsAt([50, 150])).map((d) => d.y), [50, 150]);
  assert.ok(layout(labelsAt([50, 150])).every((d) => !d.isDodged && d.elbow === 0));
});

test("odd groups use isotonic placement and stagger towards the middle", () => {
  assert.deepEqual(layout(labelsAt([100, 100, 100, 100, 100])), [
    { y: 60, elbow: 0, isDodged: true },
    { y: 80, elbow: 3, isDodged: true },
    { y: 100, elbow: 6, isDodged: true },
    { y: 120, elbow: 3, isDodged: true },
    { y: 140, elbow: 0, isDodged: true },
  ]);
});

test("even groups stagger symmetrically", () => {
  const positions = layout(labelsAt([100, 100, 100, 100]));
  assert.deepEqual(positions.map((d) => d.y), [70, 90, 110, 130]);
  assert.deepEqual(positions.map((d) => d.elbow), [0, 6, 6, 0]);
  assert.deepEqual(layout(labelsAt([100, 100])).map((d) => d.elbow), [3, 3]);
});

test("nearby labels are grouped after dodging, including an unmoved middle label", () => {
  const positions = layout(labelsAt([80, 100, 120]));
  assert.deepEqual(positions.map((d) => d.y), [80, 100, 120]);
  assert.ok(positions.every((d) => d.isDodged));
});

test("regression minimises displacement rather than anchoring the middle target", () => {
  const positions = layout(labelsAt([100, 102, 110]));
  assert.ok(Math.abs(positions[1].y - 104) < 1e-9);
  assert.deepEqual(positions.map((d) => d.y), [84, 104, 124]);
});

test("top and bottom bounds retain spacing when clusters reach another label", () => {
  for (const ys of [[0, 0, 45, 80], [220, 255, 300, 300]]) {
    const labels = labelsAt(ys);
    assertSpacingAndBounds(labels, layout(labels), 300, 4);
  }
});

test("single labels are also kept within the chart bounds", () => {
  assert.equal(layout(labelsAt([0]))[0].y, 8);
  assert.equal(layout(labelsAt([300]))[0].y, 292);
});

test("wrapped heights and original selection order are preserved", () => {
  const labels = [
    { originalY: 110, height: 48 },
    { originalY: 90, height: 16 },
    { originalY: 100, height: 32 },
  ];
  const original = structuredClone(labels);
  const positions = layout(labels);
  assertSpacingAndBounds(labels, positions, 300, 4);
  assert.ok(positions[1].y < positions[2].y && positions[2].y < positions[0].y);
  assert.ok(positions.every((d) => d.isDodged));
  assert.deepEqual(labels, original);
});

test("independent groups restart their elbow offsets", () => {
  const positions = layout(labelsAt([50, 50, 50, 200, 200, 200]));
  assert.deepEqual(positions.map((d) => d.elbow), [0, 6, 0, 0, 6, 0]);
});

test("zero spacing and custom elbow room are respected", () => {
  const labels = labelsAt([100, 100, 100]);
  const positions = layout(labels, { minSpacing: 0, elbowRoom: 4 });
  assert.deepEqual(positions.map((d) => d.y), [84, 100, 116]);
  assert.deepEqual(positions.map((d) => d.elbow), [0, 4, 0]);
});

test("overfull layouts retain finite, bounded positions", () => {
  const positions = layout(labelsAt([0, 25, 50, 75, 100], 30), { chartHeight: 100 });
  assert.ok(positions.every((d) => Number.isFinite(d.y) && d.y >= 15 && d.y <= 85));
});

test("feasible variable-height layouts preserve order, bounds and minimum spacing", () => {
  let seed = 396;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let run = 0; run < 500; run++) {
    const labels = Array.from({ length: 1 + Math.floor(random() * 10) }, () => ({
      originalY: random() * 600,
      height: 12 + Math.floor(random() * 36),
    }));
    const minSpacing = Math.floor(random() * 12);
    const positions = layout(labels, { chartHeight: 600, minSpacing });
    assertSpacingAndBounds(labels, positions, 600, minSpacing);
    assert.ok(positions.every((d) => d.elbow >= 0 && d.elbow <= 6));
  }
});
