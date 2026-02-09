import chalk from "chalk";

type DevlogEntry = {
	version: string;
	title: string;
};

export function printDateHeader(
	date: string,
	isSkipped: boolean,
	entries: DevlogEntry[] | undefined,
): void {
	if (isSkipped) {
		console.log(`${chalk.bold.blue(date)} ${chalk.dim("skipped")}`);
	} else if (entries && entries.length > 0) {
		const entryInfo = entries
			.map((e) => `${chalk.green(e.version)} ${e.title}`)
			.join(" | ");
		console.log(`${chalk.bold.blue(date)} ${entryInfo}`);
	} else {
		console.log(`${chalk.bold.blue(date)} ${chalk.red("⚠ devlog missing")}`);
	}
}
