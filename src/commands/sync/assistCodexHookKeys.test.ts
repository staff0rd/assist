import { describe, expect, it } from "vitest";
import { assistCodexHookKeys } from "./assistCodexHookKeys";

const BODY = [
	"# comment [[hooks.Stop]]",
	"[[hooks.SessionStart]]",
	"[[hooks.SessionStart.hooks]]",
	'type = "command"',
	'command = "assist codex-hook"',
	"",
	"[[hooks.PreToolUse]]",
	'matcher = "Bash"',
	"[[hooks.PreToolUse.hooks]]",
	'command = "assist codex-hook"',
	"[[hooks.PreToolUse.hooks]]",
	String.raw`command = "assist \"quoted\""`,
].join("\n");

describe("assistCodexHookKeys", () => {
	it("keys a fresh install's handlers from group zero", () => {
		expect([...assistCodexHookKeys("", BODY)]).toEqual([
			["session_start:0:0", "assist codex-hook"],
			["pre_tool_use:0:0", "assist codex-hook"],
			["pre_tool_use:0:1", 'assist "quoted"'],
		]);
	});

	it("offsets groups by the user's own hook groups before the block", () => {
		const before = [
			"[[hooks.SessionStart]]",
			"[[hooks.SessionStart.hooks]]",
			'command = "assist codex-hook"',
			"[[ hooks.SessionStart ]]",
			"[[hooks.SessionStart.hooks]]",
			'command = "echo hi"',
		].join("\n");
		expect(assistCodexHookKeys(before, BODY).get("session_start:2:0")).toBe(
			"assist codex-hook",
		);
		expect(assistCodexHookKeys(before, BODY).has("session_start:0:0")).toBe(
			false,
		);
		expect(assistCodexHookKeys(before, BODY).has("pre_tool_use:0:0")).toBe(
			true,
		);
	});
});
