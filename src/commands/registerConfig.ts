import type { Command } from "commander";
import { configList, configSet } from "./config";
import { configGet } from "./config/configGet";

export function registerConfig(program: Command): void {
	const configCommand = program
		.command("config")
		.description("View and modify assist.yml configuration");

	configCommand
		.command("set <key> <value>")
		.description("Set a config value (e.g. commit.push true)")
		.option("-g, --global", "Write to global ~/.assist.yml")
		.action((key, value, options) => configSet(key, value, options));

	configCommand
		.command("get <key>")
		.description("Get a config value")
		.action(configGet);

	configCommand
		.command("list")
		.description("List all config values")
		.action(configList);
}
