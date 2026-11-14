import { describe, expect, it } from "vitest";
import { swipeCompletes } from "./swipeCompletes";

describe("swipeCompletes", () => {
	it("completes past halfway", () => {
		expect(swipeCompletes(0.6, 0)).toBe(true);
	});

	it("cancels before halfway", () => {
		expect(swipeCompletes(0.4, 0)).toBe(false);
	});

	it("completes a short rightward flick", () => {
		expect(swipeCompletes(0.1, 1)).toBe(true);
	});

	it("cancels a leftward flick past halfway", () => {
		expect(swipeCompletes(0.8, -1)).toBe(false);
	});
});
