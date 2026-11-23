import chalk from "chalk";
import { appendComment } from "./appendComment";
import { authoredPhases } from "./authoredPhases";
import { closeRunPreviews } from "./closeRunPreviews";
import { formatItemId } from "./formatItemId";
import { missingDelivered } from "./missingDelivered";
import { findOneItem } from "./shared";
import { updateStatus } from "./updateStatus";

export async function done(id: string, summary?: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) return;

	const { orm, item } = found;
	if (item.plan && item.plan.length > 0) {
		const completedCount = (item.currentPhase ?? 1) - 1;
		const pending = authoredPhases(item.plan).slice(completedCount);
		if (pending.length > 0) {
			console.log(
				chalk.red(
					`Cannot complete item ${formatItemId(item.id)}: ${pending.length} pending phase(s):`,
				),
			);
			for (const phase of pending) {
				console.log(chalk.yellow(`  - ${phase.name}`));
			}
			process.exitCode = 1;
			return;
		}
	}

	if (missingDelivered(item)) {
		console.log(
			chalk.red(
				`Cannot complete item ${formatItemId(item.id)}: it has a why line but no Delivered statement. Run \`assist backlog delivered ${formatItemId(item.id)} "<one line: what now works>"\` first.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	if (summary) {
		const phase = item.currentPhase ?? 1;
		await appendComment(orm, item.id, summary, { phase, type: "summary" });
	}

	await updateStatus(orm, item.id, "done");
	await closeRunPreviews(item.id, "item done");

	console.log(
		chalk.green(`Completed item ${formatItemId(item.id)}: ${item.name}`),
	);
}
