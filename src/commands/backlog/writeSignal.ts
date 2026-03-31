import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBacklogDir } from "./shared";

const SIGNAL_FILE = ".assist-signal.json";

export function getSignalPath(): string {
	return join(getBacklogDir(), SIGNAL_FILE);
}

type SignalEvent = "phase-done" | "next";

export type Signal = {
	event: SignalEvent;
	[key: string]: unknown;
};

export function writeSignal(
	event: SignalEvent,
	data?: Record<string, unknown>,
): void {
	const sessionId = process.env.ASSIST_SESSION_ID;
	const signal: Signal = { event, ...(sessionId && { sessionId }), ...data };
	writeFileSync(getSignalPath(), JSON.stringify(signal));
}
