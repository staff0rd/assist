import { describe, expect, it } from "vitest";
import { buildRunEntry } from "./buildRunEntry";

describe("buildRunEntry", () => {
	it("returns command with no args for a single-word command", () => {
		const entry = buildRunEntry("lint", "eslint", []);
		expect(entry).toEqual({ name: "lint", command: "eslint" });
	});

	it("splits a multi-word command string when args is empty", () => {
		const entry = buildRunEntry(
			"verify:lint",
			"npx biome check --diagnostic-level=error",
			[],
		);
		expect(entry).toEqual({
			name: "verify:lint",
			command: "npx",
			args: ["biome", "check", "--diagnostic-level=error"],
		});
	});

	it("passes through separate args without splitting the command", () => {
		const entry = buildRunEntry("test", "npx", ["vitest", "run"]);
		expect(entry).toEqual({
			name: "test",
			command: "npx",
			args: ["vitest", "run"],
		});
	});

	it("includes cwd when provided in options", () => {
		const entry = buildRunEntry("build", "npm", ["run", "build"], {
			cwd: "../other",
		});
		expect(entry).toEqual({
			name: "build",
			command: "npm",
			args: ["run", "build"],
			cwd: "../other",
		});
	});

	it("omits cwd when not provided", () => {
		const entry = buildRunEntry("lint", "eslint", []);
		expect(entry).not.toHaveProperty("cwd");
	});
});
