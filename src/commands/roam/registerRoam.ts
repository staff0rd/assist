import type { Command } from "commander";
import { auth } from "./auth";
import { showClaudeCodeIcon } from "./showClaudeCodeIcon";

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
}
