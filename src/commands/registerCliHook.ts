import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { cliHook } from "./cliHook";
import { cliHookCheck } from "./cliHook/cliHookCheck";
import { permitCliReads } from "./permitCliReads";
import { registerDeny } from "./registerDeny";

export function registerCliHook(program: Command): void {
	const cmd = program
		.command("cli-hook")
		.description("PreToolUse hook for auto-approving read-only CLI commands")
		.action(() => {
			cliHook();
		});

	configHelp(cmd, [
		{
			key: "cliReadVerbs",
			setter: 'assist config set cliReadVerbs.git "status"',
			note: "extra per-CLI verbs treated as read-only for auto-approval",
		},
	]);

	cmd
		.command("check <command>")
		.description("Check whether a command would be auto-approved")
		.option("--tool <tool>", "Tool name to check against", "Bash")
		.action((command: string, options: { tool: string }) => {
			cliHookCheck(command, options.tool);
		});

	cmd
		.command("add")
		.description("Discover a CLI's commands and auto-permit read-only ones")
		.argument(
			"<cli...>",
			"CLI binary and optional subcommand (e.g. gh, az, acli jira)",
		)
		.option("--no-cache", "Force fresh discovery, ignoring cached results")
		.action((cli: string[], options: { cache: boolean }) => {
			permitCliReads(cli.join(" "), { noCache: !options.cache });
		});

	registerDeny(cmd);
}
