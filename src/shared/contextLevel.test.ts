import { describe, expect, it } from "vitest";
import { contextLevel } from "./contextLevel";

describe("contextLevel", () => {
	it("is dim below 20", () => {
		expect(contextLevel(19)).toBe("dim");
	});

	it("is yellow at 20", () => {
		expect(contextLevel(20)).toBe("yellow");
	});

	it("is yellow at 29", () => {
		expect(contextLevel(29)).toBe("yellow");
	});

	it("is red at 30", () => {
		expect(contextLevel(30)).toBe("red");
	});
});
