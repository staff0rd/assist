import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { internalCommand } from "../shared/internalCommand";
import { cliHookConfigHelp } from "./cliHook/cliHookConfigHelp";
import { registerDeny } from "./registerDeny";

export function registerCliHook(program: Command): void {
	const cmd = program
		.command("cli-hook")
		.description("PreToolUse hook for auto-approving read-only CLI commands")
		.action(async () => {
			const { cliHook } = await import("./cliHook");
			cliHook();
		});

	internalCommand(cmd, "the PreToolUse hook on shell commands and reads");
	configHelp(cmd, cliHookConfigHelp);

	cmd
		.command("check <command>")
		.description("Check whether a command would be auto-approved")
		.option("--tool <tool>", "Tool name to check against", "Bash")
		.action(async (command: string, options: { tool: string }) => {
			const { cliHookCheck } = await import("./cliHook/cliHookCheck");
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
		.action(async (cli: string[], options: { cache: boolean }) => {
			const { permitCliReads } = await import("./permitCliReads");
			permitCliReads(cli.join(" "), { noCache: !options.cache });
		});

	registerDeny(cmd);
}
