import chalk from "chalk";

function formatCell(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

export function printTable(rows: Record<string, unknown>[]): void {
	if (rows.length === 0) {
		console.log(chalk.yellow("(no rows)"));
		return;
	}

	const columns = Object.keys(rows[0]);
	const widths = columns.map((col) =>
		Math.max(col.length, ...rows.map((r) => formatCell(r[col]).length)),
	);

	const header = columns.map((c, i) => c.padEnd(widths[i])).join("  ");
	console.log(chalk.dim(header));
	console.log(chalk.dim("-".repeat(header.length)));

	for (const row of rows) {
		const line = columns
			.map((c, i) => formatCell(row[c]).padEnd(widths[i]))
			.join("  ");
		console.log(line);
	}

	console.log(chalk.dim(`\n${rows.length} row${rows.length === 1 ? "" : "s"}`));
}
