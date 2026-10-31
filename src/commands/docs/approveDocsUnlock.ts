import { unlinkSync } from "node:fs";
import { formatItemId } from "../backlog/formatItemId";
import { findOneItem } from "../backlog/shared";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import type { PinConfirmResult } from "../notify/PinConfirmResult";
import { getDocsUnlockPinPath } from "./getDocsUnlockPinPath";
import { readDocsUnlockPinState } from "./readDocsUnlockPinState";
import { recordDocsUnlock } from "./recordDocsUnlock";

export async function approveDocsUnlock(
	pin: string,
): Promise<PinConfirmResult | undefined> {
	sweepRestrictedDir();
	const state = readDocsUnlockPinState(pin);
	if (!state) return undefined;
	unlinkSync(getDocsUnlockPinPath(pin));

	const found = await findOneItem(String(state.itemId));
	if (!found)
		return {
			ok: false,
			message: `Item ${formatItemId(state.itemId)} not found; nothing was approved.`,
		};

	const label = `${formatItemId(state.itemId)} ${found.item.name}`;
	if ((found.item.currentPhase ?? 1) !== state.phase)
		return {
			ok: false,
			message: `${label} has moved on from phase ${state.phase} since the unlock was requested. Nothing was approved; request a new unlock from the current phase.`,
		};

	await recordDocsUnlock(found.orm, state.itemId, state.phase);
	return {
		ok: true,
		message: `Approved docs changes for phase ${state.phase} of ${label}. Its sessions may edit and commit docs pages and screenshots until the item moves on from that phase or is done or won't-do.`,
	};
}
