import type { Command } from "commander";
import { registerRunAdd } from "./registerRunAdd";
import { lazyAction } from "../../shared/lazyAction";

export function registerRunSubcommands(runCommand: Command): void {
	runCommand
		.command("list")
		.description("List configured run commands")
		.option("-v, --verbose", "Show full command details")
		.action(async (opts) =>
			(await import("../run")).listRunConfigs(!!opts.verbose),
		);

	registerRunAdd(runCommand);

	runCommand
		.command("link")
		.description("Link run configurations from another project's assist.yml")
		.argument("<path>", "Relative path to the linked project")
		.requiredOption("--prefix <prefix>", "Namespace prefix for linked commands")
		.allowUnknownOption()
		.action(lazyAction(() => import("./link"), "link"));

	runCommand
		.command("remove")
		.description(
			"Remove a run configuration from assist.yml, or with --repo from the shared db",
		)
		.argument("<name>", "Name of the run configuration to remove")
		.option(
			"--repo [name]",
			"Remove from a repo's override in the shared db instead of assist.yml (defaults to the current repo)",
		)
		.action(lazyAction(() => import("./remove"), "remove"));
}
