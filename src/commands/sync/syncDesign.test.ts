import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncDesign } from "./syncDesign";

describe("syncDesign", () => {
	let claudeDir: string;
	let targetBase: string;

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		claudeDir = mkdtempSync(join(tmpdir(), "assist-design-source-"));
		targetBase = mkdtempSync(join(tmpdir(), "assist-design-target-"));
		writeFileSync(join(claudeDir, "system-prompt.md"), "DESIGN PROMPT");
		mkdirSync(join(claudeDir, "skills"));
		writeFileSync(join(claudeDir, "skills", "polish-pass.md"), "POLISH");
		writeFileSync(join(claudeDir, "skills", "wireframe.md"), "WIRE");
	});

	afterEach(() => {
		rmSync(claudeDir, { recursive: true, force: true });
		rmSync(targetBase, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("copies the design system prompt into the target base", () => {
		syncDesign(claudeDir, targetBase);

		expect(readFileSync(join(targetBase, "system-prompt.md"), "utf8")).toBe(
			"DESIGN PROMPT",
		);
	});

	it("copies every design skill into the target skills directory", () => {
		syncDesign(claudeDir, targetBase);

		expect(
			readFileSync(join(targetBase, "skills", "polish-pass.md"), "utf8"),
		).toBe("POLISH");
		expect(
			readFileSync(join(targetBase, "skills", "wireframe.md"), "utf8"),
		).toBe("WIRE");
	});

	it("preserves unrelated files already in the target skills directory", () => {
		mkdirSync(join(targetBase, "skills"));
		writeFileSync(join(targetBase, "skills", "projects.json"), "{}");

		syncDesign(claudeDir, targetBase);

		expect(existsSync(join(targetBase, "skills", "projects.json"))).toBe(true);
	});
});
