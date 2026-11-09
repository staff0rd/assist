import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../shared/harnesses";
import { withSpinner } from "../../shared/withSpinner";
import { formatScanUsage } from "./formatScanUsage";
import { inboxScanBlocker } from "./inboxScanBlocker";
import { runInboxScan } from "./runInboxScan";

export async function scan(
	options: { harness?: HarnessKind } = {},
): Promise<void> {
	const blocker = inboxScanBlocker(options.harness);
	if (blocker) {
		console.error(chalk.red(blocker));
		process.exitCode = 1;
		return;
	}
	const { flagged, added, usage } = await runInboxScan(await getDb(), {
		trigger: "manual",
		adapter: harnessAdapter(options.harness),
		wrap: (since, run) =>
			withSpinner(
				`Scanning Gmail and Slack (Slack since ${since.toISOString()})`,
				run,
			),
	});
	console.log(
		`Flagged ${flagged} message(s) needing a reply, ${chalk.bold(added)} new. ${chalk.dim(formatScanUsage(usage))}`,
	);
}
