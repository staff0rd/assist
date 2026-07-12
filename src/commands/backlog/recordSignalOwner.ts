import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

function getOwnerPath(itemId: number): string {
	return join(homedir(), ".assist", "signals", `owner-${itemId}.json`);
}

export function recordSignalOwner(itemId: number): void {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId) return;
	const path = getOwnerPath(itemId);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify({ sessionId }));
}

export function readSignalOwner(itemId: number): string | undefined {
	const path = getOwnerPath(itemId);
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

export function clearSignalOwner(itemId: number): void {
	const path = getOwnerPath(itemId);
	try {
		rmSync(path);
	} catch {}
}
