import { attemptAutoRestart } from "./attemptAutoRestart";
import {
	type AutoRestartInput,
	autoRestartBlocker,
} from "./autoRestartBlocker";
import { type AutoRestartTarget, autoRestartTarget } from "./autoRestartTarget";

export const AUTO_RESTART_SETTLE_MS = 60_000;

export type AutoRestartSnapshot = AutoRestartInput & { built: string };

type AutoRestartCheckDeps = {
	enabled: () => boolean;
	snapshot: () => Promise<AutoRestartSnapshot>;
	attempted: { get: () => string | undefined; set: (built: string) => void };
	restart: (target: AutoRestartTarget) => Promise<void>;
	log: (message: string) => void;
	now?: () => number;
};

function skipReason(
	snap: AutoRestartSnapshot,
	attempted: string | undefined,
): string | undefined {
	if (attempted === snap.built) return `: already attempted for v${snap.built}`;
	const blocker = autoRestartBlocker(snap);
	return blocker && ` for v${snap.built}: ${blocker}`;
}

export function createAutoRestartCheck(deps: AutoRestartCheckDeps) {
	const now = deps.now ?? Date.now;
	let idleSince: number | undefined;
	let lastNote: string | undefined;

	const note = (message: string | undefined) => {
		if (message !== undefined && message !== lastNote)
			deps.log(`auto-restart: ${message}`);
		lastNote = message;
		idleSince = undefined;
	};

	return async function tick(): Promise<void> {
		if (!deps.enabled()) return note(undefined);
		const snap = await deps.snapshot();
		if (snap.restart.length === 0) return note(undefined);
		const target = autoRestartTarget(snap.restart);
		const skip = skipReason(snap, deps.attempted.get());
		if (skip) return note(`skipped ${target} restart${skip}`);
		const at = now();
		if (idleSince === undefined) {
			note(
				`${target} restart for v${snap.built} ready; restarting once idle for ${AUTO_RESTART_SETTLE_MS / 1000}s`,
			);
			idleSince = at;
			return;
		}
		if (at - idleSince < AUTO_RESTART_SETTLE_MS) return;
		note(undefined);
		await attemptAutoRestart(deps, target, snap.built);
	};
}
