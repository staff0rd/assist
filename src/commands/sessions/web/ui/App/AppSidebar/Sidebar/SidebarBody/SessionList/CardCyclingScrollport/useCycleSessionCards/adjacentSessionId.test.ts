import { describe, expect, it } from "vitest";
import { adjacentSessionId } from "./adjacentSessionId";

const order = ["a", "b", "c"];

describe("adjacentSessionId", () => {
	it("steps forward to the next id", () => {
		expect(adjacentSessionId(order, "a", 1)).toBe("b");
	});

	it("steps backward to the previous id", () => {
		expect(adjacentSessionId(order, "c", -1)).toBe("b");
	});

	it("wraps from the last id to the first", () => {
		expect(adjacentSessionId(order, "c", 1)).toBe("a");
	});

	it("wraps from the first id to the last", () => {
		expect(adjacentSessionId(order, "a", -1)).toBe("c");
	});

	it("returns the only id when there is just one", () => {
		expect(adjacentSessionId(["a"], "a", 1)).toBe("a");
	});

	it("starts at the matching end when the active id is missing", () => {
		expect(adjacentSessionId(order, null, 1)).toBe("a");
		expect(adjacentSessionId(order, "gone", -1)).toBe("c");
	});

	it("returns null for an empty order", () => {
		expect(adjacentSessionId([], "a", 1)).toBeNull();
	});
});
