import chalk from "chalk";
import type { RepoRow } from "./types";

function colorStatus(status: RepoRow["status"]): string {
	if (status === "missing") return chalk.red(status);
	if (status === "outdated") return chalk.yellow(status);
	return chalk.green(status);
}

function formatRow(row: RepoRow, nameWidth: number): string {
	const week = (row.lastWeek ?? "-").padEnd(9);
	return `${row.name.padEnd(nameWidth)}  ${row.lastPush}  ${week}  ${colorStatus(row.status)}`;
}

export function printReposTable(rows: RepoRow[]): void {
	const nameWidth = Math.max(4, ...rows.map((r) => r.name.length));
	const header = [
		"Repo".padEnd(nameWidth),
		"Last Push".padEnd(10),
		"Last Week".padEnd(9),
		"Status",
	].join("  ");
	console.log(chalk.dim(header));
	console.log(chalk.dim("-".repeat(header.length)));

	for (const row of rows) {
		console.log(formatRow(row, nameWidth));
	}
}
