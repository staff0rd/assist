import type { Command } from "commander";

export function registerLandCommand(cmd: Command): void {
	cmd
		.command("land")
		.description(
			"Land this parallel phase's commits on the item branch: rebase onto it, run assist verify if it moved, then fast-forward it",
		)
		.action(async () => {
			const { landPhase } = await import("./phaseRun/landPhase");
			landPhase();
		});
}
