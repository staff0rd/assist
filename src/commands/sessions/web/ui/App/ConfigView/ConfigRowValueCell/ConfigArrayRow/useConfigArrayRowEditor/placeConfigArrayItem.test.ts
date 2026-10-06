import { describe, expect, it } from "vitest";
import { placeConfigArrayItem } from "./placeConfigArrayItem";

describe("placeConfigArrayItem", () => {
	it("replaces the item at the index", () => {
		expect(
			placeConfigArrayItem(["a", "b"], { kind: "replace", index: 1 }, "x"),
		).toEqual(["a", "x"]);
	});

	it("inserts before the item at the index", () => {
		expect(
			placeConfigArrayItem(["a", "b"], { kind: "insert", index: 1 }, "x"),
		).toEqual(["a", "x", "b"]);
	});

	it("inserts at the end when the index is past the last item", () => {
		expect(
			placeConfigArrayItem(["a", "b"], { kind: "insert", index: 2 }, "x"),
		).toEqual(["a", "b", "x"]);
	});

	it("appends without a placement", () => {
		expect(placeConfigArrayItem(["a"], undefined, "x")).toEqual(["a", "x"]);
	});
});
