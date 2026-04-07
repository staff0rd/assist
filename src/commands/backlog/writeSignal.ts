import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getBacklogDir } from "./shared";

export function getSignalPath(): string {
	const sessionId = process.env.ASSIST_SESSION_ID;
	const filename = sessionId
		? `.assist-signal-${sessionId}.json`
		: ".assist-signal.json";
	return join(getBacklogDir(), filename);
}

type SignalEvent = "phase-done" | "next" | "rewind";

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
