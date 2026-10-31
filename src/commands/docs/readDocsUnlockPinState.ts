import { existsSync, readFileSync } from "node:fs";
import { getDocsUnlockPinPath } from "./getDocsUnlockPinPath";

type DocsUnlockPinState = { pin: string; itemId: number; phase: number };

function isPositiveInteger(value: unknown): boolean {
	return Number.isInteger(value) && (value as number) > 0;
}

export function readDocsUnlockPinState(
	pin: string,
): DocsUnlockPinState | undefined {
	const path = getDocsUnlockPinPath(pin);
	if (!existsSync(path)) return undefined;
	try {
		const state: DocsUnlockPinState = JSON.parse(readFileSync(path, "utf8"));
		if (state.pin !== pin) return undefined;
		if (!isPositiveInteger(state.itemId)) return undefined;
		if (!isPositiveInteger(state.phase)) return undefined;
		return state;
	} catch {
		return undefined;
	}
}
