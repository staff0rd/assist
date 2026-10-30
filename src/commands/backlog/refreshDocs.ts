import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { requestDocsRefresh } from "./requestDocsRefresh";
import { getOrigin, getReady } from "./shared";

export async function refreshDocs(): Promise<void> {
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
