import type { Command } from "commander";
import { addRule } from "./rules/addRule";
import { indexRules } from "./rules/indexRules";
import { listRules } from "./rules/listRules";

export function registerRules(program: Command): void {
	const rulesCommand = program
		.command("rules")
		.description("Read and write the CLAUDE.md rules in scope for a path");

	rulesCommand
		.command("list [path]")
		.description(
			"List the rules from the `## Rules` section of every CLAUDE.md from a path's directory up to the repo root (default: cwd)",
		)
		.option("--full", "Show each rule's full description as well as its title")
		.action((target: string | undefined, options: { full?: boolean }) =>
			listRules(target, options),
		);

	rulesCommand
		.command("add <text>")
		.description(
			"Add a rule to the `## Rules` section of the scope's CLAUDE.md, allocating the next repo-wide code and creating the section when absent",
		)
		.option(
			"--title <title>",
			"As few words as possible summarising the rule, shown in the rule picker in place of the description",
		)
		.option(
			"--scope <path>",
			"File or directory whose nearest CLAUDE.md receives the rule, or a CLAUDE.md path to write to directly (default: cwd)",
		)
		.action((text: string, options: { scope?: string; title?: string }) =>
			addRule(text, options),
		);

	rulesCommand
		.command("index")
		.description(
			"Record the directories that carry their own `## Rules` in the repo root's CLAUDE.md, so scoped rules are discoverable from the root. Always repo-wide, resolved from the cwd",
		)
		.action(() => indexRules());
}
