import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { configList } from "./configList";
import { configConfigHelp } from "./config/configConfigHelp";
import { configGet } from "./config/configGet";
import { configKeys } from "./config/configKeys";
import { configSet } from "./config/configSet";
import { configUnset } from "./config/configUnset";

export function registerConfig(program: Command): void {
	const configCommand = configHelp(
		program
			.command("config")
			.description("View and modify assist.yml configuration"),
		configConfigHelp,
		"Run 'assist config keys [filter]' to list every config key with its default,\nwhat it does, and the command that sets it.",
	);

	configCommand
		.command("set <key> [value]")
		.description("Set a config value (e.g. commit.push true)")
		.option("-g, --global", "Write to global ~/.assist.yml")
		.option(
			"-r, --repo [name]",
			"Requires -g: scope the global write to a repo's identity (defaults to the current repo)",
		)
		.action((key, value, options) => configSet(key, value, options));

	configCommand
		.command("unset [key]")
		.description("Remove a config value (e.g. commit.push)")
		.option("-g, --global", "Remove from global ~/.assist.yml")
		.option(
			"-r, --repo [name]",
			"Requires -g: remove the key from a repo's identity block (defaults to the current repo)",
		)
		.action((key, options) => configUnset(key, options));

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
