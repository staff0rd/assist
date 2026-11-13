import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { registerRulesAdd } from "./rules/registerRulesAdd";
import { lazyAction } from "../shared/lazyAction";

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
		.action(async (target: string | undefined, options: { full?: boolean }) =>
			(await import("./rules/listRules")).listRules(target, options),
		);

	registerRulesAdd(rulesCommand);

	internalCommand(
		rulesCommand
			.command("index")
			.description(
				"Record the directories that carry their own `## Rules` in the repo root's CLAUDE.md, so scoped rules are discoverable from the root. Always repo-wide, resolved from the cwd",
			)
			.action(lazyAction(() => import("./rules/indexRules"), "indexRules")),
		"/fix-rules",
	);
}
