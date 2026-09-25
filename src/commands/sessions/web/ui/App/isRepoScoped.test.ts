import { describe, expect, it } from "vitest";
import { isRepoScoped } from "./isRepoScoped";

describe("isRepoScoped", () => {
	it("treats update sessions as unscoped", () => {
		expect(isRepoScoped("update")).toBe(false);
	});

	it("treats every other type as repo scoped", () => {
		for (const type of [
			"draft",
			"next",
			"bug",
			"refine",
			"review",
			"design",
			"prompt",
			"run",
		] as const)
			expect(isRepoScoped(type)).toBe(true);
	});

	it("treats an unknown type as repo scoped", () => {
		expect(isRepoScoped(undefined)).toBe(true);
	});
});
