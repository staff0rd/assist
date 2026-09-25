import { describe, expect, it } from "vitest";
import { removeIds } from "./removeIds";

describe("removeIds", () => {
	it("returns the same set when no id is present", () => {
		const set = new Set(["a", "b"]);
		expect(removeIds(set, ["c"])).toBe(set);
	});

	it("returns a new set without the removed ids", () => {
		const set = new Set(["a", "b", "c"]);
		const result = removeIds(set, ["a", "c"]);
		expect(result).not.toBe(set);
		expect([...result]).toEqual(["b"]);
	});
});
