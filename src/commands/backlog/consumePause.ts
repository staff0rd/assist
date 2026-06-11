import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function getControlsDir(): string {
	return join(homedir(), ".assist", "controls");
}

function getPausePath(itemId: number): string {
	return join(getControlsDir(), `pause-${itemId}.json`);
}

export function requestPause(itemId: number): void {
	mkdirSync(getControlsDir(), { recursive: true });
	writeFileSync(
		getPausePath(itemId),
		JSON.stringify({ timestamp: new Date().toISOString() }),
	);
}

export function isPausePending(itemId: number): boolean {
	return existsSync(getPausePath(itemId));
}

export function clearPause(itemId: number): void {
	try {
		unlinkSync(getPausePath(itemId));
	} catch {
		// Control file may not exist; nothing to clear
	}
}

/** Returns whether a pause was pending, clearing it so the request is one-shot. */
export function consumePause(itemId: number): boolean {
	const pausePath = getPausePath(itemId);
	if (!existsSync(pausePath)) return false;
	try {
		unlinkSync(pausePath);
	} catch {
		// Control file may already be removed
	}
	return true;
}
