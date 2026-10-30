import type { Command } from "commander";
import { configSet } from "./configSet";
import { configUnset } from "./configUnset";

export function registerConfigWrites(configCommand: Command): void {
	configCommand
		.command("set <key> [value]")
		.description(
			"Set a config value (e.g. commit.push true); with no scope flag it writes repo (git), this repo's assist.yml",
		)
		.option(
			"-r, --repo [name]",
			"Write to repo (db): a repo's override in the shared db, seen by every node (defaults to the current repo)",
		)
		.option("--node", "Write to user (node): this node's ~/.assist.yml")
		.option(
			"-u, --user",
			"Write to user (db): the shared db, applied to every repo on every node",
		)
		.action((key, value, options) => configSet(key, value, options));

	configCommand
		.command("unset [key]")
		.description(
			"Remove a config value (e.g. commit.push); with no scope flag it removes it from repo (git), this repo's assist.yml",
		)
		.option(
			"-r, --repo [name]",
			"Remove from repo (db): a repo's override in the shared db (defaults to the current repo)",
		)
		.option("--node", "Remove from user (node): this node's ~/.assist.yml")
		.option("-u, --user", "Remove from user (db) in the shared db")
		.action((key, options) => configUnset(key, options));
}
