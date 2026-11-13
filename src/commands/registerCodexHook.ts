import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { lazyAction } from "../shared/lazyAction";

export function registerCodexHook(program: Command): void {
	internalCommand(
		program
			.command("codex-hook")
			.description(
				"Codex hook: auto-approves read-only CLI commands (PreToolUse/PermissionRequest) and reports session status (running/waiting) to the sessions daemon",
			)
			.action(lazyAction(() => import("./codexHook"), "codexHook")),
		"Codex's hooks",
	);
	internalCommand(
		program
			.command("codex-hook-trust")
			.description(
				"Record Codex trust for exactly Assist's installed codex-hook definitions, so Codex starts without a hook review; any other hook still needs Codex's normal review",
			)
			.action(
				lazyAction(
					() => import("./codexHook/codexHookTrust"),
					"codexHookTrust",
				),
			),
		"Assist's Codex launches",
	);
}
