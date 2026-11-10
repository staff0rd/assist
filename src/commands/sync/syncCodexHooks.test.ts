import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { assistCodexHookKeys } from "./assistCodexHookKeys";
import { upsertManagedBlock } from "./upsertManagedBlock";

const BODY = '[[hooks.PreToolUse]]\nmatcher = "Bash"';

describe("codex/config.toml", () => {
	const shipped = readFileSync(
		resolve(__dirname, "../../../codex/config.toml"),
		"utf8",
	);

	it("registers the hook for SessionStart so Codex receives the composed advice", () => {
		expect(shipped).toContain(
			'[[hooks.SessionStart]]\n[[hooks.SessionStart.hooks]]\ntype = "command"\ncommand = "assist codex-hook"',
		);
	});

	it("gives each of the six shipped events exactly one handler key to trust", () => {
		expect([...assistCodexHookKeys("", shipped)]).toEqual([
			["session_start:0:0", "assist codex-hook"],
			["user_prompt_submit:0:0", "assist codex-hook"],
			["pre_tool_use:0:0", "assist codex-hook"],
			["post_tool_use:0:0", "assist codex-hook"],
			["permission_request:0:0", "assist codex-hook"],
			["stop:0:0", "assist codex-hook"],
		]);
	});
});

describe("upsertManagedBlock", () => {
	it("wraps the body in a managed block for an empty config", () => {
		const result = upsertManagedBlock("", BODY);
		expect(result).toContain("assist codex hooks (managed)");
		expect(result).toContain('[[hooks.PreToolUse]]\nmatcher = "Bash"');
	});

	it("preserves existing config content when appending", () => {
		const result = upsertManagedBlock('model = "gpt-5.5"\n', BODY);
		expect(result).toContain('model = "gpt-5.5"');
		expect(result).toContain("[[hooks.PreToolUse]]");
		expect(result.indexOf("model")).toBeLessThan(
			result.indexOf("[[hooks.PreToolUse]]"),
		);
	});

	it("replaces an existing managed block rather than duplicating it", () => {
		const once = upsertManagedBlock('model = "gpt-5.5"\n', BODY);
		const twice = upsertManagedBlock(once, BODY);
		expect(twice.split("[[hooks.PreToolUse]]").length - 1).toBe(1);
		expect(twice.split("assist codex hooks (managed)").length - 1).toBe(2);
		expect(twice).toContain('model = "gpt-5.5"');
	});

	it("keeps user content that follows the managed block", () => {
		const once = upsertManagedBlock("", BODY);
		const withTrailer = `${once}\n[profile]\nname = "x"\n`;
		const result = upsertManagedBlock(withTrailer, BODY);
		expect(result).toContain("[profile]");
		expect(result.split("[[hooks.PreToolUse]]").length - 1).toBe(1);
	});

	it("moves the trust Codex records inside the block out, so a resync keeps it", () => {
		const once = upsertManagedBlock("", BODY);
		const trusted = once.replace(
			"# <<<",
			'[hooks.state]\n\n[hooks.state."/h/config.toml:pre_tool_use:0:0"]\ntrusted_hash = "sha256:a"\n\n[projects."/repo"]\ntrust_level = "trusted"\n# <<<',
		);
		const result = upsertManagedBlock(trusted, BODY);
		const end = result.indexOf("# <<< assist codex hooks");
		expect(result.indexOf('trusted_hash = "sha256:a"')).toBeGreaterThan(end);
		expect(result.indexOf('[projects."/repo"]')).toBeGreaterThan(end);
		expect(upsertManagedBlock(result, BODY)).toBe(result);
	});

	it("does not mistake a changed shipped body for foreign content", () => {
		const once = upsertManagedBlock("", BODY);
		const result = upsertManagedBlock(
			once,
			'[[hooks.Stop]]\n[[hooks.Stop.hooks]]\ncommand = "assist codex-hook --v2"',
		);
		expect(result).not.toContain("PreToolUse");
		expect(
			result.trim().endsWith("# <<< assist codex hooks (managed) <<<"),
		).toBe(true);
	});
});
