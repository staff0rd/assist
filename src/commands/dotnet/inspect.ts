import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { checkBuildLocks } from "./checkBuildLocks";
import { deadCodeRules } from "./deadCodeRules";
import { displayIssues } from "./displayIssues";
import { findSolution } from "./findSolution";
import { parseInspectReport } from "./parseInspectReport";
import { assertJbInstalled, runInspectCode } from "./runInspectCode";

function getChangedCsFiles(ref: string | undefined): string[] {
	const cmd = ref
		? `git diff --name-only ${ref}~1 ${ref}`
		: "git diff --name-only HEAD";
	const output = execSync(cmd, { encoding: "utf-8" }).trim();
	if (output === "") return [];
	return output.split("\n").filter((f) => f.toLowerCase().endsWith(".cs"));
}

export async function inspect(
	sln: string | undefined,
	options: { ref?: string; all?: boolean },
): Promise<void> {
	let resolved: string;
	if (sln) {
		resolved = path.resolve(sln);
		if (!existsSync(resolved)) {
			console.error(chalk.red(`Solution file not found: ${resolved}`));
			process.exit(1);
		}
	} else {
		resolved = findSolution();
	}

	checkBuildLocks();
	assertJbInstalled();

	const changedFiles = getChangedCsFiles(options.ref);
	if (changedFiles.length === 0) {
		console.log(chalk.green("No changed .cs files found"));
		return;
	}

	console.log(
		chalk.dim(`Inspecting ${changedFiles.length} changed file(s)...`),
	);

	const report = runInspectCode(resolved, changedFiles.join(";"));
	const allIssues = parseInspectReport(report);
	const issues = options.all
		? allIssues
		: allIssues.filter((i) => deadCodeRules.has(i.typeId));

	if (issues.length === 0) {
		console.log(chalk.green("No issues found"));
		return;
	}

	displayIssues(issues);
	process.exit(1);
}
