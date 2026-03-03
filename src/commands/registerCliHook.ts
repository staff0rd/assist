import type { Command } from "commander";
import { cliHook } from "./cliHook";
import { cliHookCheck } from "./cliHook/cliHookCheck";
import { permitCliReads } from "./permitCliReads";

export function registerCliHook(program: Command): void {
	const cmd = program
		.command("cli-hook")
		.description("PreToolUse hook for auto-approving read-only CLI commands")
		.action(() => {
			cliHook();
		});

	cmd
		.command("check <command>")
		.description("Check whether a command would be auto-approved")
		.action((command: string) => {
			cliHookCheck(command);
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
}
