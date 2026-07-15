import { describe, expect, it } from "vitest";
import { upsertManagedBlock } from "./syncCodexHooks";

const BODY = '[[hooks.PreToolUse]]\nmatcher = "Bash"';

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
});
