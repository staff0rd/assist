import chalk from "chalk";
import { printPrStatus } from "./printPrStatus";
import type { PrsStatusReport } from "./types";

export function printPrsStatus(
	report: Pick<PrsStatusReport, "repos" | "errors">,
): void {
	for (const repo of report.repos) {
		const count = repo.pullRequests.length;
		console.log(`${chalk.bold(repo.repo)} ${chalk.dim(`(${count} open)`)}`);
		for (const pr of repo.pullRequests) {
			printPrStatus(pr);
		}
		if (count === 0) console.log(chalk.dim("  no open pull requests"));
		console.log();
	}

	if (report.errors.length === 0) return;

	console.log(chalk.bold("Errors"));
	for (const failure of report.errors) {
		console.log(`  ${chalk.red(failure.repo)}: ${failure.error}`);
	}
	console.log();
}
