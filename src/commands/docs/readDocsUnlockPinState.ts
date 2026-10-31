import { existsSync, readFileSync } from "node:fs";
import { getDocsUnlockPinPath } from "./getDocsUnlockPinPath";

type DocsUnlockPinState = { pin: string; itemId: number };

export function readDocsUnlockPinState(
	pin: string,
): DocsUnlockPinState | undefined {
	const path = getDocsUnlockPinPath(pin);
	if (!existsSync(path)) return undefined;
	try {
		const state: DocsUnlockPinState = JSON.parse(readFileSync(path, "utf8"));
		if (state.pin !== pin) return undefined;
		if (!Number.isInteger(state.itemId) || state.itemId <= 0) return undefined;
		return state;
	} catch {
		return undefined;
	}
}
