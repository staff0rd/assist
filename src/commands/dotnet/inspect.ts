import { existsSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { formatElapsed } from "../../shared/formatElapsed";
import { checkBuildLocks } from "./checkBuildLocks";
import { displayIssues } from "./displayIssues";
import { filterIssues } from "./filterIssues";
import { findSolution } from "./findSolution";
import { getChangedCsFiles } from "./getChangedCsFiles";
import { parseInspectReport } from "./parseInspectReport";
import { assertJbInstalled, runInspectCode } from "./runInspectCode";

function resolveSolution(sln: string | undefined): string {
	if (sln) {
		const resolved = path.resolve(sln);
		if (!existsSync(resolved)) {
			console.error(chalk.red(`Solution file not found: ${resolved}`));
			process.exit(1);
		}
		return resolved;
	}
	return findSolution();
}

function reportResults(
	issues: ReturnType<typeof filterIssues>,
	elapsed: number,
): void {
	if (issues.length > 0) displayIssues(issues);
	else console.log(chalk.green("No issues found"));

	console.log(chalk.dim(`Completed in ${formatElapsed(elapsed)}`));
	if (issues.length > 0) process.exit(1);
}

export async function inspect(
	sln: string | undefined,
	options: { ref?: string; base?: string; all?: boolean; swea?: boolean },
): Promise<void> {
	const resolved = resolveSolution(sln);
	checkBuildLocks();
	assertJbInstalled();

	const changedFiles = getChangedCsFiles(options.ref, options.base);
	if (changedFiles.length === 0) {
		console.log(chalk.green("No changed .cs files found"));
		return;
	}

	console.log(
		chalk.dim(`Inspecting ${changedFiles.length} changed file(s)...`),
	);

	const start = Date.now();
	const report = runInspectCode(
		resolved,
		changedFiles.join(";"),
		!!options.swea,
	);
	const elapsed = Date.now() - start;
	const issues = filterIssues(parseInspectReport(report), !!options.all);

	reportResults(issues, elapsed);
}
