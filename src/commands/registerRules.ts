import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { indexRules } from "./rules/indexRules";
import { listRules } from "./rules/listRules";
import { registerRulesAdd } from "./rules/registerRulesAdd";

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

	registerRulesAdd(rulesCommand);

	internalCommand(
		rulesCommand
			.command("index")
			.description(
				"Record the directories that carry their own `## Rules` in the repo root's CLAUDE.md, so scoped rules are discoverable from the root. Always repo-wide, resolved from the cwd",
			)
			.action(() => indexRules()),
		"/fix-rules",
	);
}
