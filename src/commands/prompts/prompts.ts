import { openPromptsDb } from "../cliHook/logDeniedToolCall";
import { printPromptsTable } from "./printPromptsTable";

type DbRow = {
	tool: string;
	command: string;
	count: number;
	repos: string;
};

export function prompts(): void {
	const db = openPromptsDb();

	const rows = db
		.prepare(
			`SELECT tool, command, COUNT(*) as count,
				GROUP_CONCAT(DISTINCT repo) as repos
			 FROM denied_tool_calls
			 GROUP BY tool, command
			 ORDER BY count DESC
			 LIMIT 10`,
		)
		.all() as DbRow[];

	if (rows.length === 0) {
		console.log("No denied tool calls recorded yet.");
		return;
	}

	printPromptsTable(rows);
}
