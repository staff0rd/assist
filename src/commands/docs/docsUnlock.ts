import { randomInt } from "node:crypto";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { formatItemId } from "../backlog/formatItemId";
import { findOneItem } from "../backlog/shared";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { showNotification } from "../notify/showNotification";
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
	const phase = found.item.currentPhase;
	if (!phase) {
		fail(
			`${formatItemId(itemId)} has no current phase. Docs unlock applies to the phase a session is running.`,
		);
		return;
	}
	const label = `${formatItemId(itemId)} ${found.item.name} (phase ${phase})`;

	const pin = randomInt(0, 1000).toString().padStart(3, "0");
	mkdirSync(getRestrictedDir(), { recursive: true });
	sweepRestrictedDir();
	const pinPath = getDocsUnlockPinPath(pin);
	writeFileSync(pinPath, JSON.stringify({ pin, itemId, phase }));

	const delivered = showNotification({
		title: `assist docs unlock: ${label}`,
		message: `Pin ${pin} — run: assist docs confirm ${pin}`,
	});

	if (!delivered) {
		unlinkSync(pinPath);
		fail(
			"Could not deliver the confirmation pin via notification.\nDocs cannot be unlocked until the notification channel works.",
		);
		return;
	}

	console.log(
		`A confirmation pin was sent to the user's desktop notifications.\nTo let this phase of ${label} edit docs pages and screenshots, the user runs:\n${chalk.cyan("  assist docs confirm <PIN>")}\nWait for the user to confirm before editing docs.`,
	);
}
