import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
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

	configHelp(roamCommand, [
		{
			key: "roam.clientId",
			setter: "assist roam auth",
			note: "OAuth client ID (written by the auth flow)",
		},
		{
			key: "roam.clientSecret",
			setter: "assist roam auth",
			note: "OAuth client secret (written by the auth flow)",
		},
		{
			key: "roam.accessToken",
			setter: "assist roam auth",
			note: "OAuth access token (managed by the auth flow)",
		},
		{
			key: "roam.refreshToken",
			setter: "assist roam auth",
			note: "OAuth refresh token (managed by the auth flow)",
		},
		{
			key: "roam.tokenExpiresAt",
			setter: "assist roam auth",
			note: "access-token expiry epoch (managed by the auth flow)",
		},
	]);
}
