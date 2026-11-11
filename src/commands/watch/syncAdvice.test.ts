import { describe, expect, it } from "vitest";
import { syncAdvice } from "./syncAdvice";

describe("syncAdvice", () => {
	it("reports a changed command", () => {
		expect(syncAdvice(["agent/commands/watch.md", "README.md"])).toEqual([
			"agent/commands changed",
		]);
	});

	it("reports a changed skill", () => {
		expect(syncAdvice(["agent/skills/design/SKILL.md"])).toEqual([
			"agent/skills changed",
		]);
	});

	it("reports changed settings", () => {
		expect(syncAdvice(["claude/settings.json"])).toEqual([
			"claude/settings.json changed",
		]);
	});

	it("reports a changed design system prompt", () => {
		expect(syncAdvice(["agent/design-system-prompt.md"])).toEqual([
			"agent/design-system-prompt.md changed",
		]);
	});

	it("reports changed codex sources", () => {
		expect(syncAdvice(["codex/config.toml"])).toEqual([
			"codex sources changed",
		]);
	});

	it("reports changed pi sources", () => {
		expect(syncAdvice(["pi/permission-gate.ts"])).toEqual([
			"pi sources changed",
		]);
	});

	it("lists every reason the pull makes necessary, in rule order", () => {
		expect(
			syncAdvice([
				"pi/status-driver.ts",
				"claude/settings.json",
				"agent/commands/sync.md",
			]),
		).toEqual([
			"agent/commands changed",
			"claude/settings.json changed",
			"pi sources changed",
		]);
	});

	it("reports nothing when unrelated paths changed", () => {
		expect(
			syncAdvice([
				"src/commands/watch/watchWait.ts",
				"README.md",
				"claude/other.md",
			]),
		).toEqual([]);
	});

	it("reports nothing when nothing changed", () => {
		expect(syncAdvice([])).toEqual([]);
	});
});
