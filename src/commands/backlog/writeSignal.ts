import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { readSignalOwner } from "./recordSignalOwner";

export function getSignalPath(
	sessionId: string | undefined = process.env.ASSIST_SESSION_ID,
): string | undefined {
	if (!sessionId) return undefined;
	return join(homedir(), ".assist", "signals", `signal-${sessionId}.json`);
}

type SignalEvent = "phase-done" | "next" | "rewind" | "done";

export type Signal = {
	event: SignalEvent;
	[key: string]: unknown;
};

function resolveSignalTarget(
	event: SignalEvent,
	data?: Record<string, unknown>,
): string | undefined {
	const caller = process.env.ASSIST_SESSION_ID;
	const itemId = typeof data?.itemId === "number" ? data.itemId : undefined;
	if (itemId === undefined) return caller;

	const owner = readSignalOwner(itemId);
	if (owner) {
		if (caller && owner !== caller) {
			console.log(
				chalk.dim(
					`Routing ${event} signal for item ${itemId} to its run (${owner}), not this session (${caller}).`,
				),
			);
		}
		return owner;
	}

	if (caller) {
		console.log(
			chalk.yellow(
				`Not signalling ${event} for item ${itemId}: no live run owns it, and this session (${caller}) does not either.`,
			),
		);
	}
	return undefined;
}

export function writeSignal(
	event: SignalEvent,
	data?: Record<string, unknown>,
): void {
	const target = resolveSignalTarget(event, data);
	if (!target) return;
	const path = getSignalPath(target);
	if (!path) return;
	const signal: Signal = { event, sessionId: target, ...data };
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, JSON.stringify(signal));
}
