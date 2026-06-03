import type { Command } from "commander";
import { phaseDone as backlogPhaseDone, plan as backlogPlan } from "../backlog";

export function registerPlanCommands(cmd: Command): void {
	cmd
		.command("plan <id>")
		.description("Display the plan for a backlog item")
		.action(backlogPlan);

	cmd
		.command("phase-done <id> <phase> <summary>")
		.description("Signal that a plan phase is complete")
		.action(backlogPhaseDone);
}
