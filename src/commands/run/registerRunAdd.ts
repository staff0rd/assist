import type { Command } from "commander";
import { add } from "./add";
import { runAddHelpText } from "./runAddHelpText";

export function registerRunAdd(runCommand: Command): void {
	runCommand
		.command("add")
		.description(
			"Add a new run configuration to assist.yml, or with --repo to the shared db",
		)
		.argument("<name>", "Name for the run configuration")
		.argument("<command>", "Command to execute")
		.argument("[args...]", "Static args to pass to the command")
		.option(
			"--cwd <dir>",
			"Working directory (resolved relative to the config file)",
		)
		.option(
			"--server [group]",
			"Mark as a singleton dev server, optionally in a named group (default group: default)",
		)
		.option("--port <port>", "Display-only port shown on the serving card")
		.option(
			"--protocol <http|https>",
			"Protocol for the serving card's port link (default: http)",
		)
		.option(
			"--path <path>",
			"Path for the serving card's port link, e.g. /swagger (default: /)",
		)
		.option(
			"--env <KEY=VALUE>",
			"Environment variable for the command (repeatable)",
		)
		.option("--pre <command>", "Shell command run first (repeatable)")
		.option(
			"--filter <glob>",
			"Only run a verify: entry when a changed file matches",
		)
		.option("--quiet", "Suppress output unless the command fails")
		.option(
			"--param <spec>",
			"Positional param: <name>, <name>! (required) or <name>=<default> (repeatable)",
		)
		.option(
			"--repo [name]",
			"Write to a repo's override in the shared db, seen by every node, instead of assist.yml (defaults to the current repo; no command file is created)",
		)
		.addHelpText("after", runAddHelpText)
		.allowUnknownOption()
		.allowExcessArguments()
		.action(() => add());
}
