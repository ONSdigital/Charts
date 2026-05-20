import { describe, it, expect } from "vitest";
import { AccurateBeeswarm } from "../helpers.js";

// ---------------------------------------------------------------------------
// AccurateBeeswarm
// ---------------------------------------------------------------------------
describe("AccurateBeeswarm", () => {
  describe("initialization", () => {
    it("constructs with items, radius, and xFun", () => {
      const items = [{ value: 1 }, { value: 2 }];
      const radius = 5;
      const xFun = (d) => d.value;

      const beeswarm = new AccurateBeeswarm(items, radius, xFun);

      expect(beeswarm.items).toBe(items);
      expect(beeswarm.diameter).toBe(10);
      expect(beeswarm.diameterSq).toBe(100);
    });

    it("sets default tieBreakFn to identity function", () => {
      const beeswarm = new AccurateBeeswarm([{ value: 1 }], 5, (d) => d.value);
      expect(beeswarm.tieBreakFn(10)).toBe(10);
    });
  });

  describe("calculateYPositions", () => {
    it("returns array of items with x, y, and datum", () => {
      const items = [
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 3, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBe(3);
      positions.forEach((pos, i) => {
        expect(pos).toHaveProperty("datum");
        expect(pos).toHaveProperty("x");
        expect(pos).toHaveProperty("y");
        expect(pos.datum).toBe(items[i]);
      });
    });

    it("preserves original item order in result", () => {
      const items = [
        { id: "a", value: 30 },
        { id: "b", value: 10 },
        { id: "c", value: 20 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 3, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions[0].datum.id).toBe("a");
      expect(positions[1].datum.id).toBe("b");
      expect(positions[2].datum.id).toBe("c");
    });

    it("sets x based on xFun result", () => {
      const items = [
        { value: 5 },
        { value: 15 },
        { value: 25 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 2, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions[0].x).toBe(5);
      expect(positions[1].x).toBe(15);
      expect(positions[2].x).toBe(25);
    });

    it("assigns y positions without collisions when radius is adequate", () => {
      const items = [
        { value: 0 },
        { value: 100 },
        { value: 200 },
      ];
      const radius = 25; // Large enough to prevent collisions
      const beeswarm = new AccurateBeeswarm(items, radius, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      // Check that points don't overlap
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          expect(distance).toBeGreaterThanOrEqual(radius * 2 * 0.99); // Allow tiny floating point errors
        }
      }
    });

    it("handles single item without error", () => {
      const items = [{ value: 50 }];
      const beeswarm = new AccurateBeeswarm(items, 3, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions.length).toBe(1);
      expect(positions[0].y).toBe(0);
    });

    it("handles items with identical x values", () => {
      const items = [
        { value: 50 },
        { value: 50 },
        { value: 50 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 5, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions.length).toBe(3);
      // All should be at same x
      positions.forEach((p) => {
        expect(p.x).toBe(50);
      });
      // But y positions should differ
      const yValues = positions.map((p) => p.y);
      const uniqueYs = new Set(yValues);
      expect(uniqueYs.size).toBeGreaterThan(1);
    });
  });

  describe("withTiesBrokenByArrayOrder", () => {
    it("uses array index as tie-breaker", () => {
      const items = [
        { value: 50, label: "first" },
        { value: 50, label: "second" },
        { value: 50, label: "third" },
      ];
      const beeswarm = new AccurateBeeswarm(items, 5, (d) => d.value);
      beeswarm.withTiesBrokenByArrayOrder();

      const positions = beeswarm.calculateYPositions();

      expect(positions[0].datum.label).toBe("first");
      expect(positions[1].datum.label).toBe("second");
      expect(positions[2].datum.label).toBe("third");
    });

    it("returns self for chaining", () => {
      const beeswarm = new AccurateBeeswarm([{ value: 1 }], 5, (d) => d.value);
      const result = beeswarm.withTiesBrokenByArrayOrder();

      expect(result).toBe(beeswarm);
    });
  });

  describe("withTiesBrokenRandomly", () => {
    it("uses random function as tie-breaker", () => {
      const items = [
        { value: 50 },
        { value: 50 },
        { value: 50 },
        { value: 50 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 5, (d) => d.value);
      beeswarm.withTiesBrokenRandomly();

      const positions = beeswarm.calculateYPositions();

      // Should still have valid positions
      expect(positions.length).toBe(4);
      positions.forEach((p) => {
        expect(typeof p.y).toBe("number");
      });
    });

    it("returns self for chaining", () => {
      const beeswarm = new AccurateBeeswarm([{ value: 1 }], 5, (d) => d.value);
      const result = beeswarm.withTiesBrokenRandomly();

      expect(result).toBe(beeswarm);
    });
  });

  describe("oneSided", () => {
    it("constrains points to positive y only", () => {
      const items = [
        { value: 10 },
        { value: 20 },
        { value: 30 },
        { value: 40 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 3, (d) => d.value);
      beeswarm.oneSided();

      const positions = beeswarm.calculateYPositions();

      positions.forEach((p) => {
        expect(p.y).toBeGreaterThanOrEqual(0);
      });
    });

    it("spreads points more vertically in one-sided mode", () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        value: i * 10,
      }));
      const radius = 2;

      // Two-sided layout
      const beeswarmBothSides = new AccurateBeeswarm(items, radius, (d) => d.value);
      const positionsBothSides = beeswarmBothSides.calculateYPositions();

      // One-sided layout
      const beeswarmOneSided = new AccurateBeeswarm(items, radius, (d) => d.value);
      beeswarmOneSided.oneSided();
      const positionsOneSided = beeswarmOneSided.calculateYPositions();

      // One-sided should have larger y-range
      const yRangeBothSides = Math.max(...positionsBothSides.map((p) => Math.abs(p.y))) -
        Math.min(...positionsBothSides.map((p) => Math.abs(p.y)));
      const yRangeOneSided = Math.max(...positionsOneSided.map((p) => p.y)) -
        Math.min(...positionsOneSided.map((p) => p.y));

      expect(yRangeOneSided).toBeGreaterThan(yRangeBothSides);
    });

    it("returns self for chaining", () => {
      const beeswarm = new AccurateBeeswarm([{ value: 1 }], 5, (d) => d.value);
      const result = beeswarm.oneSided();

      expect(result).toBe(beeswarm);
    });
  });

  describe("chaining", () => {
    it("allows method chaining", () => {
      const items = [
        { value: 10 },
        { value: 20 },
        { value: 30 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 3, (d) => d.value);

      const positions = beeswarm
        .withTiesBrokenByArrayOrder()
        .oneSided()
        .calculateYPositions();

      expect(Array.isArray(positions)).toBe(true);
      expect(positions.length).toBe(3);
      positions.forEach((p) => {
        expect(p.y).toBeGreaterThanOrEqual(0); // One-sided constraint
      });
    });
  });

  describe("edge cases", () => {
    it("handles empty items array", () => {
      const beeswarm = new AccurateBeeswarm([], 5, (d) => d.value);
      const positions = beeswarm.calculateYPositions();

      expect(positions.length).toBe(0);
    });

    it("handles very small radius", () => {
      const items = [
        { value: 0 },
        { value: 1 },
        { value: 2 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 0.1, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions.length).toBe(3);
      positions.forEach((p) => {
        expect(typeof p.y).toBe("number");
        expect(isFinite(p.y)).toBe(true);
      });
    });

    it("handles large number of items", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        value: Math.random() * 100,
      }));
      const beeswarm = new AccurateBeeswarm(items, 2, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions.length).toBe(100);
      expect(positions.every((p) => typeof p.y === "number")).toBe(true);
    });

    it("handles negative x values", () => {
      const items = [
        { value: -50 },
        { value: 0 },
        { value: 50 },
      ];
      const beeswarm = new AccurateBeeswarm(items, 5, (d) => d.value);

      const positions = beeswarm.calculateYPositions();

      expect(positions[0].x).toBe(-50);
      expect(positions[1].x).toBe(0);
      expect(positions[2].x).toBe(50);
    });
  });
});
