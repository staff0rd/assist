import chalk from "chalk";
import { unlandedPhaseError } from "./unlandedPhaseError";

/** Report and refuse phase-done for a parallel phase whose work has not landed on the item branch. */
export function refuseUnlanded(phaseNumber: number): boolean {
	const unlanded = unlandedPhaseError(phaseNumber);
	if (!unlanded) return false;
	console.log(chalk.red(unlanded));
	process.exitCode = 1;
	return true;
}
