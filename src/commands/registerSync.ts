import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { rootConfigHelp } from "./rootConfigHelp";
import { sync } from "./sync";

export function registerSync(program: Command): void {
	const syncCommand = program
		.command("sync")
		.description(
			"Install commands as ~/.claude/skills/<name>/SKILL.md, so they take precedence over a project skill of the same name, and delete any ~/.claude/commands/<name>.md an earlier sync copied; when codex is detected, also install commands as ~/.codex/skills/<name>/SKILL.md and register the assist codex-hook in ~/.codex/config.toml, which auto-approves read-only commands and injects the repo's composed advice on SessionStart; when pi is detected, also install commands as ~/.pi/agent/prompts/<name>.md and install the assist extensions into ~/.pi/agent/extensions, which gate permissions and inject the same advice. No global instructions file is written — every harness composes its own from assist advise at session start, and any ~/.claude/CLAUDE.md, ~/.codex/AGENTS.md or ~/.pi/agent/AGENTS.md an earlier sync left behind is named so you can remove it. A target that exists and was not written by sync is never overwritten or deleted without confirmation; with --yes it is left in place and reported. With --prune, also report files an earlier sync wrote that assist no longer ships, and with --prune --force remove them",
		)
		.option("-y, --yes", "Overwrite settings.json without prompting")
		.option(
			"--prune",
			"After syncing, list files an earlier sync wrote (recorded in ~/.assist/sync-manifest.json) whose name is no longer in the repo's claude/commands/*.md set; files sync did not write are listed separately and never removed",
		)
		.option(
			"--force",
			"With --prune, remove the listed orphaned files; a claude or codex skill directory is removed only when SKILL.md is its sole content. Errors without --prune",
		)
		.action((options) => {
			if (options.force && !options.prune) {
				console.error("--force requires --prune.");
				process.exit(1);
			}
			return sync(options);
		});

	configHelp(syncCommand, rootConfigHelp.sync);
}
