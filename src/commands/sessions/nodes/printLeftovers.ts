import chalk from "chalk";
import type { LeftoverReport } from "../shared/LeftoverReport";

export function printLeftovers(reports: LeftoverReport[]): void {
	for (const report of reports) {
		console.log(
			chalk.yellow(
				`${report.nodeName}: ${report.leftovers.length} leftover workspace(s) assist could not delete`,
			),
		);
		for (const { path, reason } of report.leftovers)
			console.log(`  ${path}\n    ${chalk.dim(reason)}`);
		console.log(
			`  Remove them on ${report.nodeName} with:\n    ${report.command}`,
		);
	}
}
