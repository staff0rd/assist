import chalk from "chalk";
import { dependsOnError } from "./dependsOnError";

/**
 * Parse `--depends-on` values for the phase at `phaseNumber`: undefined when
 * omitted, [] for `none`, or false after reporting an invalid reference.
 */
export function parseDependsOnOption(
	values: string[] | undefined,
	phaseNumber: number,
): number[] | undefined | false {
	if (values === undefined) return undefined;
	const dependsOn = values
		.flatMap((value) => value.split(","))
		.map((value) => value.trim())
		.filter((value) => value !== "" && value.toLowerCase() !== "none")
		.map(Number);
	const error = dependsOnError(dependsOn, phaseNumber);
	if (!error) return dependsOn;
	console.log(chalk.red(error));
	process.exitCode = 1;
	return false;
}
