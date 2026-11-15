import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

function getOwnerPath(itemId: number, phaseIdx?: number): string {
	const suffix = phaseIdx === undefined ? "" : `-p${phaseIdx}`;
	return join(homedir(), ".assist", "signals", `owner-${itemId}${suffix}.json`);
}

/** Record this session as the one whose signals an item's run (or, with phaseIdx, one parallel phase) reads. */
export function recordSignalOwner(itemId: number, phaseIdx?: number): void {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId) return;
	const path = getOwnerPath(itemId, phaseIdx);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify({ sessionId }));
}

export function readSignalOwner(
	itemId: number,
	phaseIdx?: number,
): string | undefined {
	const path = getOwnerPath(itemId, phaseIdx);
	if (!existsSync(path)) return undefined;
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8")) as {
			sessionId?: string;
		};
		return parsed.sessionId;
	} catch {
		return undefined;
	}
}

export function clearSignalOwner(itemId: number, phaseIdx?: number): void {
	const path = getOwnerPath(itemId, phaseIdx);
	try {
		rmSync(path);
	} catch {}
}
