import chalk from "chalk";
import { fetchLatestSignedExtension } from "./fetchLatestSignedExtension";

export async function printExtensionUrl(): Promise<void> {
	const { updateUrl, latest } = await fetchLatestSignedExtension();
	if (!latest) {
		console.log(chalk.red(`no signed build found in ${updateUrl}`));
		process.exitCode = 1;
		return;
	}
	console.log(latest.update_link);
}
