import chalk from "chalk";
import { parallelPhasesEnabled } from "./parallelPhasesEnabled";

/** Refuse a parallel-phase command while backlog.parallelPhases is off. */
export function refuseParallelPhasesOff(command: string): boolean {
	if (parallelPhasesEnabled()) return false;
	console.log(
		chalk.red(
			`'assist backlog ${command}' needs parallel phases: run 'assist config set backlog.parallelPhases true' to turn them on.`,
		),
	);
	process.exitCode = 1;
	return true;
}
