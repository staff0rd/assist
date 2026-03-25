import chalk from "chalk";
import { formatElapsed } from "../../shared/formatElapsed";
import { checkBuildLocks } from "./checkBuildLocks";
import { displayIssues } from "./displayIssues";
import { filterIssues } from "./filterIssues";
import { getChangedCsFiles } from "./getChangedCsFiles";
import { resolveSolution } from "./resolveSolution";
import { runEngine } from "./runEngine";
import { assertJbInstalled } from "./runInspectCode";
import { assertMsbuildInstalled } from "./runRoslynInspect";

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
	options: {
		ref?: string;
		base?: string;
		all?: boolean;
		swea?: boolean;
		roslyn?: boolean;
	},
): Promise<void> {
	const resolved = resolveSolution(sln);
	checkBuildLocks();

	if (options.roslyn) assertMsbuildInstalled();
	else assertJbInstalled();

	const changedFiles = getChangedCsFiles(options.ref, options.base);
	if (changedFiles.length === 0) {
		console.log(chalk.green("No changed .cs files found"));
		return;
	}

	console.log(
		chalk.dim(`Inspecting ${changedFiles.length} changed file(s)...`),
	);

	const start = Date.now();
	const issues = runEngine(resolved, changedFiles, options);
	const elapsed = Date.now() - start;

	reportResults(filterIssues(issues, !!options.all), elapsed);
}
