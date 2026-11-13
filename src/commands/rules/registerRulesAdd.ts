import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
type RulesAddOptions = {
	scope?: string;
	title?: string;
	user?: boolean;
	node?: boolean;
	repo?: boolean | string;
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
			.option(
				"--repo [name]",
				"As --user, but append to advice.rules in repo (db), the shared per-repo override every node sees, for the current repo or the named one",
			)
			.action(async (text: string, options: RulesAddOptions) => {
				const { addRule } = await import("./addRule");
				const { addUserRule } = await import("./addUserRule");
				return options.user || options.node || options.repo !== undefined
					? addUserRule(text, options)
					: addRule(text, options);
			}),
		"/add-rule and /fix-rules",
	);
}
