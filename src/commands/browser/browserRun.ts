import { readFileSync } from "node:fs";
import chalk from "chalk";
import { formatRunOutcome } from "./formatRunOutcome";
import { requestTab } from "./requestTab";

export async function browserRun(options: {
	file: string;
	url?: string;
	server: string;
}): Promise<void> {
	let code: string;
	try {
		code = readFileSync(options.file, "utf8");
	} catch (error) {
		console.error(
			chalk.red(
				`Error: cannot read ${options.file}: ${(error as Error).message}`,
			),
		);
		process.exit(1);
	}
	console.log("waiting for approval in the browser…");
	const result = await requestTab(options.server, {
		op: "run",
		url: options.url,
		code,
	});
	const { ok, message } = formatRunOutcome(result);
	if (ok) {
		console.log(message);
		return;
	}
	console.error(chalk.red(message));
	process.exit(1);
}
