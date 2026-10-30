import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { configList } from "./configList";
import { configConfigHelp } from "./config/configConfigHelp";
import { configGet } from "./config/configGet";
import { configImportRepos } from "./config/configImportRepos";
import { configImportUser } from "./config/configImportUser";
import { configKeys } from "./config/configKeys";
import { registerConfigWrites } from "./config/registerConfigWrites";

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
		.action(configImportRepos);

	configCommand
		.command("import-user [keys...]")
		.description(
			"Move keys (default advice.rules) from this node's ~/.assist.yml into user (db), the shared db applied to every repo on every node, showing a diff and asking first. Array keys append the entries user (db) lacks",
		)
		.action((keys: string[]) => configImportUser(keys));

	configCommand
		.command("get <key>")
		.description("Get a config value (secrets print as <hidden>)")
		.option("--reveal", "Print the raw value of a secret, undecorated")
		.action((key, options) => configGet(key, options));

	configCommand
		.command("list")
		.description(
			"List the config values that are set (secrets print as <hidden>); see 'config keys' for every key",
		)
		.action(configList);

	configCommand
		.command("keys [filter]")
		.description(
			"List every config key with its default, note and setter (filter narrows by key substring)",
		)
		.action((filter) => configKeys(filter));
}
