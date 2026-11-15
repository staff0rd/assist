import type { Command } from "commander";

export function registerRunPhaseCommand(cmd: Command): void {
	cmd
		.command("run-phase <id> <phase>", { hidden: true })
		.description(
			"Run one ready phase in this worktree, alongside the item's other ready phases (started by 'backlog run')",
		)
		.requiredOption("--token <token>", "Run token the phase was assigned")
		.requiredOption(
			"--item-tree <path>",
			"Worktree holding the item branch the phase lands on",
		)
		.option("--no-write", "Run the harness without write access")
		.option("--harness <harness>", "Coding harness to launch")
		.option("--model <model>", "Model to launch the harness with")
		.option(
			"--resume-session <id>",
			"Resume the phase's interrupted session (used by the sessions daemon on restart)",
		)
		.action(
			async (
				id: string,
				phase: string,
				opts: {
					token: string;
					itemTree: string;
					write?: boolean;
					harness?: string;
					model?: string;
					resumeSession?: string;
				},
			) => {
				const { refuseParallelPhasesOff } =
					await import("./phaseRun/refuseParallelPhasesOff");
				if (refuseParallelPhasesOff("run-phase")) return;
				const { resolveHarness } = await import("./resolveHarness");
				const { resolveModel } = await import("./resolveModel");
				const { runParallelPhase } =
					await import("./phaseRun/runParallelPhase");
				const harness = resolveHarness(opts.harness, "run");
				const ok = await runParallelPhase(id, Number(phase), {
					token: opts.token,
					itemTree: opts.itemTree,
					allowEdits: opts.write !== false,
					harness,
					model: resolveModel(opts.model, "run", harness),
					resumeSessionId: opts.resumeSession,
				});
				if (!ok) process.exitCode = 1;
			},
		);
}
