import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { addRule } from "./addRule";
import { addUserRule } from "./addUserRule";

type RulesAddOptions = {
	scope?: string;
	title?: string;
	user?: boolean;
	node?: boolean;
};

export function registerRulesAdd(rulesCommand: Command): void {
	internalCommand(
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
			.option(
				"--user",
				"Append the rule to advice.rules in user (db), the shared db, instead of a CLAUDE.md: for rules about agent conduct that hold in every repo on every node. Needs --title; takes no R-code and cannot be combined with --scope",
			)
			.option(
				"--node",
				"As --user, but append to advice.rules in user (node), this node's ~/.assist.yml",
			)
			.action((text: string, options: RulesAddOptions) =>
				options.user || options.node
					? addUserRule(text, options)
					: addRule(text, options),
			),
		"/add-rule and /fix-rules",
	);
}
