import type { Command } from "commander";
import { listRunConfigs, run } from ".";
import { add } from "./add";
import { formatConfiguredCommands } from "./formatConfiguredCommands";
import { link } from "./link";
import { remove } from "./remove";

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

	runCommand
		.command("list")
		.description("List configured run commands")
		.option("-v, --verbose", "Show full command details")
		.action((opts) => listRunConfigs(!!opts.verbose));

	runCommand
		.command("add")
		.description("Add a new run configuration to assist.yml")
		.argument("<name>", "Name for the run configuration")
		.argument("<command>", "Command to execute")
		.argument("[args...]", "Static args to pass to the command")
		.option(
			"--cwd <dir>",
			"Working directory (resolved relative to the config file)",
		)
		.addHelpText(
			"after",
			'\nPositional params can be added to the config manually:\n  params:\n    - name: env        # assist run deploy prod → appends "prod"\n      required: true\n    - name: tag\n      default: latest',
		)
		.allowUnknownOption()
		.allowExcessArguments()
		.action(() => add());

	runCommand
		.command("link")
		.description("Link run configurations from another project's assist.yml")
		.argument("<path>", "Relative path to the linked project")
		.requiredOption("--prefix <prefix>", "Namespace prefix for linked commands")
		.allowUnknownOption()
		.action(() => link());

	runCommand
		.command("remove")
		.description("Remove a run configuration from assist.yml")
		.argument("<name>", "Name of the run configuration to remove")
		.action(() => remove());
}
