import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export function getSignalPath(): string | undefined {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId) return undefined;
	return join(homedir(), ".assist", "signals", `signal-${sessionId}.json`);
}

type SignalEvent = "phase-done" | "next" | "rewind" | "done";

export type Signal = {
	event: SignalEvent;
	[key: string]: unknown;
};

export function writeSignal(
	event: SignalEvent,
	data?: Record<string, unknown>,
): void {
	const path = getSignalPath();
	if (!path) return;
	const sessionId = process.env.ASSIST_SESSION_ID;
	const signal: Signal = { event, ...(sessionId && { sessionId }), ...data };
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(signal));
}
