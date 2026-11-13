import chalk from "chalk";
import { ensureRemoteOrigin } from "./ensureRemoteOrigin";
import { readProposedItem } from "./propose/readProposedItem";
import { reviewProposal } from "./propose/reviewProposal";
import { saveProposedItem } from "./propose/saveProposedItem";
import { startProposedRun } from "./propose/startProposedRun";
import { type ProposalTracker, trackProposal } from "./propose/trackProposal";
import { exitNoPreview } from "../sessions/shared/exitNoPreview";

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

	let tracker: ProposalTracker | undefined;
	try {
		tracker = sessionId ? trackProposal(sessionId) : undefined;
	} catch (error) {
		exitNoPreview(error);
	}
	try {
		const approval = await reviewProposal(
			item,
			sessionId,
			options.confirmed === true,
			tracker?.knownPredecessor(),
		);
		if (!approval) return;

		const id = await saveProposedItem(item, tracker);
		if (approval.autostart) await startProposedRun(id, approval.startOn);
	} finally {
		tracker?.close();
	}
}
