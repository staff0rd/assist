import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";

function collect(value: string, previous: string[]): string[] {
	return [...previous, value];
}

export function registerUpdateFieldCommand(cmd: Command): void {
	internalCommand(
		cmd
			.command("update-field <id>")
			.description("Update fields on a backlog item")
			.option("--name <name>", "New item name")
			.option(
				"--desc <description>",
				String.raw`New description (Markdown supported; use \n for line breaks)`,
			)
			.option("--type <type>", "New type (story or bug)")
			.option("--ac <criterion...>", "Replace acceptance criteria (repeatable)")
			.option(
				"--add-ac <text>",
				"Append one acceptance criterion (repeatable)",
				collect,
				[],
			)
			.option(
				"--edit-ac <n> <text...>",
				"Replace acceptance criterion n (1-based) in place",
			)
			.option("--remove-ac <n>", "Remove acceptance criterion n (1-based)")
			.option(
				"--origin [origin]",
				"Retag the item to a different repo (origin URL or key, normalized); with no value, retags to the current repo's origin",
			)
			.action(lazyAction(() => import("./update/update"), "update")),
		"/refine",
	);
}
