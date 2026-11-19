import { describe, expect, it } from "vitest";
import { missingBuildTool } from "./missingBuildTool";

describe("missingBuildTool", () => {
	it("names the tool bash could not find, with its install hint", () => {
		expect(
			missingBuildTool(
				"bash",
				127,
				"/usr/bin/bash: line 1: pnpm: command not found\n",
			),
		).toBe(
			"pnpm is not installed; install it with: npm install -g pnpm (or: corepack enable pnpm)",
		);
	});

	it("names the tool cmd.exe could not find on exit 9009", () => {
		expect(
			missingBuildTool(
				"cmd",
				9009,
				"'yarn' is not recognized as an internal or external command,\r\n",
			),
		).toBe(
			"yarn is not installed; install it with: npm install -g yarn (or: corepack enable yarn)",
		);
	});

	it("falls back to the configured command when the output names no tool", () => {
		expect(missingBuildTool("pnpm", 127, "")).toBe(
			"pnpm is not installed; install it with: npm install -g pnpm (or: corepack enable pnpm)",
		);
	});

	it("says nothing for an ordinary build failure", () => {
		expect(missingBuildTool("bash", 2, "tsc: error TS2345")).toBeNull();
	});
});
