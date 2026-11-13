import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { configConfigHelp } from "./config/configConfigHelp";
import { registerConfigWrites } from "./config/registerConfigWrites";
import { lazyAction } from "../shared/lazyAction";

export function registerConfig(program: Command): void {
	const configCommand = configHelp(
		program
			.command("config")
			.description("View and modify assist.yml configuration"),
		configConfigHelp,
		"Run 'assist config keys [filter]' to list every config key with its default,\nwhat it does, and the command that sets it.",
	);

	registerConfigWrites(configCommand);

	configCommand
		.command("import-repos")
		.description(
			"Move this machine's ~/.assist.yml repos: overrides into the shared db, showing a per-key diff and asking first",
		)
		.action(
			lazyAction(
				() => import("./config/configImportRepos"),
				"configImportRepos",
			),
		);

	configCommand
		.command("import-user [keys...]")
		.description(
			"Move keys (default advice.rules) from this node's ~/.assist.yml into user (db), the shared db applied to every repo on every node, showing a diff and asking first. Array keys append the entries user (db) lacks",
		)
		.action(async (keys: string[]) =>
			(await import("./config/configImportUser")).configImportUser(keys),
		);

	configCommand
		.command("get <key>")
		.description("Get a config value (secrets print as <hidden>)")
		.option("--reveal", "Print the raw value of a secret, undecorated")
		.action(lazyAction(() => import("./config/configGet"), "configGet"));

	configCommand
		.command("list")
		.description(
			"List the config values that are set (secrets print as <hidden>); see 'config keys' for every key",
		)
		.action(lazyAction(() => import("./configList"), "configList"));

	configCommand
		.command("keys [filter]")
		.description(
			"List every config key with its default, note and setter (filter narrows by key substring)",
		)
		.action(lazyAction(() => import("./config/configKeys"), "configKeys"));
}
