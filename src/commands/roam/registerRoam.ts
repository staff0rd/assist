import type { Command } from "commander";
import { auth } from "./auth";
import { showClaudeCodeIcon } from "./showClaudeCodeIcon";
import { showCodexIcon } from "./showCodexIcon";
import { stopClaudeCodeIcon } from "./stopClaudeCodeIcon";
import { stopCodexIcon } from "./stopCodexIcon";

export function registerRoam(program: Command): void {
	const roamCommand = program
		.command("roam")
		.description("Roam Research utilities");

	roamCommand
		.command("auth")
		.description("Configure Roam API credentials")
		.action(auth);

	roamCommand
		.command("show-claude-code-icon")
		.description("Forward Claude Code hook activity to Roam local API")
		.action(showClaudeCodeIcon);

	roamCommand
		.command("stop-claude-code-icon")
		.description("Signal Claude Code session stop to Roam local API")
		.action(stopClaudeCodeIcon);

	roamCommand
		.command("show-codex-icon")
		.description("Forward Codex hook activity to Roam local API")
		.action(showCodexIcon);

	roamCommand
		.command("stop-codex-icon")
		.description("Signal Codex session stop to Roam local API")
		.action(stopCodexIcon);
}
