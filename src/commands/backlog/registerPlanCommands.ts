import type { Command } from "commander";
import { internalCommand } from "../../shared/internalCommand";
import { lazyAction } from "../../shared/lazyAction";

export function registerPlanCommands(cmd: Command): void {
	cmd
		.command("plan <id>")
		.description("Display the plan for a backlog item")
		.action(lazyAction(() => import("./plan"), "plan"));

	internalCommand(
		cmd
			.command("phase-done <id> <phase> <summary>")
			.description("Signal that a plan phase is complete")
			.action(lazyAction(() => import("./phaseDone"), "phaseDone")),
		"the agent running each phase of a backlog run",
	);
}
