import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { run } from ".";
import { formatConfiguredCommands } from "./formatConfiguredCommands";
import { registerRunSubcommands } from "./registerRunSubcommands";
import { runConfigHelp } from "./runConfigHelp";

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
		)
		.addHelpText("after", () => formatConfiguredCommands())
		.action((name, args) => run(name, args));

	configHelp(runCommand, runConfigHelp);

	registerRunSubcommands(runCommand);
}
