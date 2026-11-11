import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { claudeToolOperations } from "./claudeToolOperations";

type HookGroup = { matcher: string; hooks: { command: string }[] };

const settings = JSON.parse(
	readFileSync(join(process.cwd(), "claude/settings.json"), "utf8"),
) as { hooks: { PreToolUse: HookGroup[] } };

function hookedBy(command: string, tool: string): boolean {
	return settings.hooks.PreToolUse.some(
		(group) =>
			group.hooks.some((hook) => hook.command === command) &&
			new RegExp(`^(?:${group.matcher})$`).test(tool),
	);
}

describe("claudeToolOperations", () => {
	it.each(["Edit", "Write", "MultiEdit", "NotebookEdit"])(
		"%s is a write the edit hook intercepts",
		(tool) => {
			const [operation] = claudeToolOperations({
				toolName: tool,
				toolInput: { file_path: "/x", notebook_path: "/x" },
			});
			expect(operation?.kind).toBe("fileWrite");
			expect(hookedBy("assist edit-hook", tool)).toBe(true);
		},
	);
});
