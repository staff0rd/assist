import chalk from "chalk";
import { formatElapsed } from "../../shared/formatElapsed";
import { checkBuildLocks } from "./checkBuildLocks";
import { displayIssues } from "./displayIssues";
import { filterIssues } from "./filterIssues";
import { getChangedCsFiles, parseScope } from "./getChangedCsFiles";
import { resolveSolution } from "./resolveSolution";
import { runEngine } from "./runEngine";
import { assertJbInstalled } from "./runInspectCode";
import { assertMsbuildInstalled } from "./runRoslynInspect";

function logScope(changedFiles: string[] | null): void {
	if (changedFiles === null) {
		console.log(chalk.dim("Inspecting full solution..."));
	} else {
		console.log(
			chalk.dim(`Inspecting ${changedFiles.length} changed file(s)...`),
		);
	}
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
	options: {
		scope?: string;
		all?: boolean;
		only?: string[];
		suppress?: string[];
		swea?: boolean;
		roslyn?: boolean;
	},
): Promise<void> {
	const resolved = resolveSolution(sln);
	checkBuildLocks();

	if (options.roslyn) assertMsbuildInstalled();
	else assertJbInstalled();

	const scope = parseScope(options.scope);
	const changedFiles = getChangedCsFiles(scope);

	if (changedFiles !== null && changedFiles.length === 0) {
		console.log(chalk.green("No changed .cs files found"));
		return;
	}

	logScope(changedFiles);

	const start = Date.now();
	const issues = runEngine(resolved, changedFiles, options);
	const elapsed = Date.now() - start;
	const { all = false, only = [], suppress = [] } = options;

	reportResults(filterIssues(issues, all, only, suppress), elapsed);
}
