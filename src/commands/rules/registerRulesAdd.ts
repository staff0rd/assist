import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import type { UserRuleOptions } from "./userRuleOptionsError";

export function registerRulesAdd(rulesCommand: Command): void {
	internalCommand(
		rulesCommand
			.command("add <text>")
			.description(
				"Add a rule to the `## Rules` section of the scope's CLAUDE.md, allocating the next repo-wide code and creating the section when absent. In a web session the rule opens in the preview pane first and is written only on approval; rejecting writes nothing and exits non-zero with the reason and comments",
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
			.action(async (text: string, options: UserRuleOptions) => {
				const { rulesAdd } = await import("./rulesAdd");
				return rulesAdd(text, options);
			}),
		"/add-rule and /fix-rules",
	);
}
