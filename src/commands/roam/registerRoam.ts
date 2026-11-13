import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerRoam(program: Command): void {
	const roamCommand = program
		.command("roam")
		.description("Roam Research utilities");

	roamCommand
		.command("show-claude-code-icon")
		.description("Forward Claude Code hook activity to Roam local API")
		.action(
			lazyAction(() => import("./showClaudeCodeIcon"), "showClaudeCodeIcon"),
		);

	roamCommand
		.command("stop-claude-code-icon")
		.description("Signal Claude Code session stop to Roam local API")
		.action(
			lazyAction(() => import("./stopClaudeCodeIcon"), "stopClaudeCodeIcon"),
		);

	roamCommand
		.command("show-codex-icon")
		.description("Forward Codex hook activity to Roam local API")
		.action(lazyAction(() => import("./showCodexIcon"), "showCodexIcon"));

	roamCommand
		.command("stop-codex-icon")
		.description("Signal Codex session stop to Roam local API")
		.action(lazyAction(() => import("./stopCodexIcon"), "stopCodexIcon"));
}
