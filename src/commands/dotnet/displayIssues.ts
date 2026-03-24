import chalk from "chalk";
import type { Issue } from "./parseInspectReport";

const SEVERITY_COLOR: Record<string, (s: string) => string> = {
	ERROR: chalk.red,
	WARNING: chalk.yellow,
	SUGGESTION: chalk.cyan,
	HINT: chalk.dim,
};

function groupByFile(issues: Issue[]): Map<string, Issue[]> {
	const byFile = new Map<string, Issue[]>();
	for (const issue of issues) {
		const existing = byFile.get(issue.file);
		if (existing) {
			existing.push(issue);
		} else {
			byFile.set(issue.file, [issue]);
		}
	}
	return byFile;
}

export function displayIssues(issues: Issue[]): void {
	for (const [file, fileIssues] of groupByFile(issues)) {
		console.log(chalk.bold(file));
		for (const issue of fileIssues.sort((a, b) => a.line - b.line)) {
			const color = SEVERITY_COLOR[issue.severity] ?? chalk.white;
			console.log(
				`  ${chalk.dim(`${issue.line}:`)} ${color(issue.severity)} [${issue.typeId}] ${issue.message}`,
			);
		}
	}
	console.log(chalk.dim(`\n${issues.length} issue(s) found`));
}
