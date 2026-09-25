import chalk from "chalk";
import { createItemWithDefaults } from "./createItemWithDefaults";
import { ensureRemoteOrigin } from "./ensureRemoteOrigin";
import { formatItemId } from "./formatItemId";
import { readProposedItem } from "./propose/readProposedItem";
import { reviewProposal } from "./propose/reviewProposal";

type ProposeOptions = {
	json: string;
	confirmed?: boolean;
};

export async function propose(options: ProposeOptions): Promise<void> {
	if (!ensureRemoteOrigin()) return;

	const sessionId =
		process.env.ASSIST_SESSION === "1"
			? process.env.ASSIST_SESSION_ID
			: undefined;

	if (sessionId && options.confirmed) {
		console.error(
			chalk.red(
				"Error: --confirmed cannot be used in a web session. The preview pane is the gate — run 'assist backlog propose --json <file|->' without --confirmed and the item is created on approval.",
			),
		);
		process.exitCode = 1;
		return;
	}

	const item = await readProposedItem(options.json);

	if (!(await reviewProposal(item, sessionId, options.confirmed === true)))
		return;

	const id = await createItemWithDefaults(item);
	console.log(chalk.green(`Added item ${formatItemId(id)}: ${item.name}`));
}
