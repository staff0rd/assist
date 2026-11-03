import chalk from "chalk";
import { docsRefreshAfter } from "./docsRefreshAfter";
import { formatItemId } from "./formatItemId";
import { requestDocsRefresh } from "./requestDocsRefresh";
import { getOrigin, getReady } from "./shared";

export async function refreshDocs(): Promise<void> {
	if (docsRefreshAfter() === undefined) {
		console.error(
			chalk.red(
				"Refresh docs is off for this repo; run `assist config set docs.refreshAfter <n>` to turn it on",
			),
		);
		process.exitCode = 1;
		return;
	}
	const { orm } = await getReady();
	const result = await requestDocsRefresh(orm, getOrigin());
	if (result.outcome === "created")
		console.log(
			chalk.green(`Created ${formatItemId(result.id)}: Refresh docs`),
		);
	else if (result.outcome === "open")
		console.log(
			chalk.yellow(
				`Refresh docs item ${formatItemId(result.id)} is already open`,
			),
		);
	else console.log(chalk.yellow("No unswept done stories; nothing to refresh"));
}
