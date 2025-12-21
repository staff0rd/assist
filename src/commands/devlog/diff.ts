import { execSync } from "node:child_process";

type DiffOptions = {
	days?: number;
};

export function diff(options: DiffOptions): void {
	const days = options.days ?? 30;

	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);

	const lines = output.trim().split("\n");
	let currentDate = "";
	let dateCount = 0;

	for (const line of lines) {
		const [date, hash, ...messageParts] = line.split("|");
		const message = messageParts.join("|");

		if (dateCount >= days && date !== currentDate) {
			break;
		}

		if (date !== currentDate) {
			if (currentDate !== "") {
				console.log();
			}
			currentDate = date;
			dateCount++;
			console.log(`\x1b[1;34m${date}\x1b[0m`);
		}

		console.log(`  \x1b[33m${hash}\x1b[0m ${message}`);
	}
}
