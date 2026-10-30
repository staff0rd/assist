import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { withSpinner } from "../../shared/withSpinner";
import { runInboxScan } from "./runInboxScan";

export async function scan(): Promise<void> {
	const { flagged, added } = await runInboxScan(await getDb(), (since, run) =>
		withSpinner(
			`Scanning Gmail and Slack (Slack since ${since.toISOString()})`,
			run,
		),
	);
	console.log(
		`Flagged ${flagged} message(s) needing a reply, ${chalk.bold(added)} new.`,
	);
}
