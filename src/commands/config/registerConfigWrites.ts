import type { Command } from "commander";
import { configSet } from "./configSet";
import { configUnset } from "./configUnset";

export function registerConfigWrites(configCommand: Command): void {
	configCommand
		.command("set <key> [value]")
		.description("Set a config value (e.g. commit.push true)")
		.option("-g, --global", "Write to global ~/.assist.yml")
		.option(
			"-r, --repo [name]",
			"Requires -g: write a repo's override to the shared db, seen by every node (defaults to the current repo)",
		)
		.option(
			"-u, --user",
			"Write to user (db): the shared db, applied to every repo on every node",
		)
		.action((key, value, options) => configSet(key, value, options));

	configCommand
		.command("unset [key]")
		.description("Remove a config value (e.g. commit.push)")
		.option("-g, --global", "Remove from global ~/.assist.yml")
		.option(
			"-r, --repo [name]",
			"Requires -g: remove the key from a repo's shared db override (defaults to the current repo)",
		)
		.option("-u, --user", "Remove from user (db) in the shared db")
		.action((key, options) => configUnset(key, options));
}
