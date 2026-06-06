import chalk from "chalk";

type CountRow = { label: string; count: number };

export function printCountTable(labelHeader: string, rows: CountRow[]): void {
	const labelWidth = Math.max(
		labelHeader.length,
		...rows.map((row) => row.label.length),
	);
	const header = `${labelHeader.padEnd(labelWidth)}  Commits`;
	console.log(chalk.dim(header));
	console.log(chalk.dim("-".repeat(header.length)));

	for (const row of rows) {
		console.log(`${row.label.padEnd(labelWidth)}  ${row.count}`);
	}
}
