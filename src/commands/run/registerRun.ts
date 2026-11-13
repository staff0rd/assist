import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { lazyHelpText } from "../../shared/lazyHelpText";
import { registerRunSubcommands } from "./registerRunSubcommands";
import { runConfigHelp } from "./runConfigHelp";
import { lazyAction } from "../../shared/lazyAction";

export function registerRun(program: Command): void {
	const runCommand = program
		.command("run")
		.description("Run a configured command from assist.yml")
		.argument("[name]", "Name of the configured command")
		.argument("[args...]", "Arguments to pass to the command")
		.allowUnknownOption()
		.addHelpText(
			"after",
			"\nAn a-prefixed item id (e.g. a555) with no matching command is an alias for\n'assist backlog run <id>' (forwards --write/--no-write/-w).",
		);
	lazyHelpText(
		runCommand,
		async () =>
			(await import("./formatConfiguredCommands")).formatConfiguredCommands,
	).action(lazyAction(() => import("../run"), "run"));

	configHelp(runCommand, runConfigHelp);

	registerRunSubcommands(runCommand);
}
