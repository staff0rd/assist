import { describe, expect, it } from "vitest";
import { setNestedValue } from "./setNestedValue";

describe("setNestedValue", () => {
	describe("when setting a top-level key", () => {
		it("should set the value", () => {
			const result = setNestedValue({}, "name", "Alice");

			expect(result).toEqual({ name: "Alice" });
		});

		it("should not mutate the original object", () => {
			const original = { name: "Alice" };

			setNestedValue(original, "name", "Bob");

			expect(original.name).toBe("Alice");
		});
	});

	describe("when setting a nested key", () => {
		it("should create intermediate objects", () => {
			const result = setNestedValue({}, "a.b.c", 42);

			expect(result).toEqual({ a: { b: { c: 42 } } });
		});

		it("should preserve existing sibling keys", () => {
			const result = setNestedValue({ a: { x: 1 } }, "a.y", 2);

			expect(result).toEqual({ a: { x: 1, y: 2 } });
		});
	});

	describe("when the next key is numeric", () => {
		it("should create an array container", () => {
			const result = setNestedValue({}, "items.0", "first");

			expect(result).toEqual({ items: ["first"] });
		});

		it("should set a value at a specific array index", () => {
			const result = setNestedValue({ items: ["a", "b"] }, "items.1", "B");

			expect(result).toEqual({ items: ["a", "B"] });
		});
	});

	describe("when overwriting a value", () => {
		it("should replace the existing value", () => {
			const result = setNestedValue({ a: { b: "old" } }, "a.b", "new");

			expect(result).toEqual({ a: { b: "new" } });
		});
	});

	describe("when the path has a single segment", () => {
		it("should behave like a simple assignment", () => {
			const result = setNestedValue({ x: 1 }, "x", 2);

			expect(result).toEqual({ x: 2 });
		});
	});

	describe("when setting a deeply nested numeric path", () => {
		it("should create nested arrays and objects", () => {
			const result = setNestedValue({}, "a.0.name", "zero");

			expect(result).toEqual({ a: [{ name: "zero" }] });
		});
	});
});
