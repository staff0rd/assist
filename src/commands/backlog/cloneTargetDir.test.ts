import { describe, expect, it } from "vitest";
import { cloneTargetDir } from "./cloneTargetDir";

describe("cloneTargetDir", () => {
	it("joins the base dir with the final origin segment", () => {
		expect(cloneTargetDir("github.com/org/repo", "/home/user/git")).toBe(
			"/home/user/git/repo",
		);
	});

	it("uses the last segment for nested group paths", () => {
		expect(cloneTargetDir("gitlab.com/group/sub/repo", "/base")).toBe(
			"/base/repo",
		);
	});

	it("returns null for local: origins", () => {
		expect(cloneTargetDir("local:/home/user/repo", "/base")).toBeNull();
	});

	it("returns null when no repo name can be derived", () => {
		expect(cloneTargetDir("/", "/base")).toBeNull();
	});
});
