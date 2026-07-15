import type { Command } from "commander";
import { codexHook } from "./codexHook";

export function registerCodexHook(program: Command): void {
	program
		.command("codex-hook")
		.description(
			"Codex PreToolUse/PermissionRequest hook for auto-approving read-only CLI commands",
		)
		.action(() => {
			codexHook();
		});
}
