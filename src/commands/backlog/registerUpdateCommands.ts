import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { registerUpdatePhaseCommand } from "./registerUpdatePhaseCommand";
import { registerUpdateFieldCommand } from "./registerUpdateFieldCommand";
import { lazyAction } from "../../shared/lazyAction";

export function registerUpdateCommands(cmd: Command): void {
	registerUpdateFieldCommand(cmd);
	registerUpdatePhaseCommand(cmd);

	cmd
		.command("remove-phase <id> <phase>")
		.description("Remove a plan phase from a backlog item")
		.action(lazyAction(() => import("./removePhase"), "removePhase"));

	internalCommand(
		cmd
			.command("update-plan <id>")
			.description(
				"Replace an item's whole plan from a JSON payload, previewed and applied in one approval",
			)
			.requiredOption(
				"--json <file|->",
				"Path to a JSON payload of { phases: [{ name, tasks, manualChecks?, dependsOn? }] }, or - to read it from stdin",
			)
			.action(lazyAction(() => import("./updatePlan"), "updatePlan")),
		"/refine",
	);

	cmd
		.command("move-phase <id> <from> <to>")
		.description(
			"Reorder a plan phase from one 1-based position to another, moving its tasks with it",
		)
		.action(lazyAction(() => import("./movePhase"), "movePhase"));

	cmd
		.command("move <id>")
		.description(
			"Reorder an item within its repo's backlog: before or after another item, or to the top or bottom",
		)
		.option("--before <id>", "Place the item directly before this item")
		.option("--after <id>", "Place the item directly after this item")
		.option("--top", "Move the item to the top of its repo's backlog")
		.option("--bottom", "Move the item to the bottom of its repo's backlog")
		.action(lazyAction(() => import("./moveItem"), "moveItem"));
}
