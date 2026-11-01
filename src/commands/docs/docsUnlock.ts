import chalk from "chalk";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { formatItemId } from "../backlog/formatItemId";
import { findOneItem } from "../backlog/shared";
import { issueUnlockPin } from "../notify/issueUnlockPin";
import { getDocsUnlockPinPath } from "./getDocsUnlockPinPath";

function fail(message: string): void {
	console.error(chalk.red(message));
	process.exitCode = 1;
}

export async function docsUnlock(): Promise<void> {
	const itemId = resolveSessionItemId();
	if (itemId === null) {
		fail(
			"No backlog item for this session (ASSIST_BACKLOG_ITEM_ID is unset). Docs unlock applies to a backlog item; outside a backlog session docs are not locked.",
		);
		return;
	}

	const found = await findOneItem(String(itemId));
	if (!found) {
		process.exitCode = 1;
		return;
	}
	const phase = found.item.currentPhase ?? 1;
	const label = `${formatItemId(itemId)} ${found.item.name} (phase ${phase})`;

	const { delivered, node } = await issueUnlockPin({
		area: "docs",
		label,
		pinPath: getDocsUnlockPinPath,
		state: { itemId, phase },
	});

	if (!delivered) {
		fail(
			"Could not deliver the confirmation pin via notification.\nDocs cannot be unlocked until the notification channel works.",
		);
		return;
	}

	console.log(
		`A confirmation pin was sent to the user's desktop notifications${node ? ` on ${node}, the node controlling this session` : ""}.\nTo let this phase of ${label} edit docs pages and screenshots, the user runs in this session:\n${chalk.cyan("  assist docs confirm <PIN>")}\nWait for the user to confirm before editing docs.`,
	);
}
