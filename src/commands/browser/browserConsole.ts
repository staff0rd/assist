import chalk from "chalk";
import { formatConsoleEntries } from "./formatConsoleEntries";
import { requestTab } from "./requestTab";

export async function browserConsole(options: {
	url?: string;
	all?: boolean;
	since?: number;
	grep?: string;
	limit?: number;
	server: string;
}): Promise<void> {
	if (options.all && options.url) {
		console.error(chalk.red("Error: pass either --url or --all, not both"));
		process.exit(1);
	}
	const result = await requestTab(options.server, {
		op: "console",
		url: options.url,
		all: options.all,
		sinceMs: options.since,
		grep: options.grep,
		limit: options.limit,
	});
	for (const line of formatConsoleEntries(result)) console.log(line);
}
