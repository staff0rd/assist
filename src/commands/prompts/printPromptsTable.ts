import chalk from "chalk";

type PromptRow = {
	tool: string;
	command: string;
	count: number;
	repos: string;
};

function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return `${str.slice(0, max - 1)}…`;
}

export function printPromptsTable(rows: PromptRow[]): void {
	const countWidth = 5;
	const toolWidth = Math.max(4, ...rows.map((r) => r.tool.length));
	const commandWidth = Math.max(
		7,
		...rows.map((r) => truncate(r.command, 60).length),
	);

	const header = [
		"#".padStart(countWidth),
		"Tool".padEnd(toolWidth),
		"Command".padEnd(commandWidth),
		"Repos",
	].join("  ");

	console.log(chalk.dim(header));
	console.log(chalk.dim("-".repeat(header.length)));

	for (const row of rows) {
		const count = String(row.count).padStart(countWidth);
		const tool = row.tool.padEnd(toolWidth);
		const command = truncate(row.command, 60).padEnd(commandWidth);

		console.log(
			`${chalk.yellow(count)}  ${tool}  ${command}  ${chalk.dim(row.repos)}`,
		);
	}
}
