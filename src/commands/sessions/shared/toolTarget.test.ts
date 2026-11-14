import { describe, expect, it } from "vitest";
import { toolTarget } from "./toolTarget";

describe("toolTarget", () => {
	it("names the skill a Skill call invokes", () => {
		expect(toolTarget({ skill: "verify", args: "--fast" })).toBe("verify");
	});

	it("prefers a file path", () => {
		expect(toolTarget({ file_path: "/a/b.ts", description: "x" })).toBe(
			"/a/b.ts",
		);
	});
});
