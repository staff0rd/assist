import type { Command } from "commander";

export function registerLandCommand(cmd: Command): void {
	cmd
		.command("land", { hidden: true })
		.description(
			"Land this parallel phase's commits: rebase onto the remote branch it tracks, run assist verify if that moved, then push to it",
		)
		.action(async () => {
			const { refuseParallelPhasesOff } =
				await import("./phaseRun/refuseParallelPhasesOff");
			if (refuseParallelPhasesOff("land")) return;
			const { landPhase } = await import("./phaseRun/landPhase");
			landPhase();
		});
}
