import { attemptAutoRestart } from "./attemptAutoRestart";
import type { AutoRestartInput } from "./autoRestartBlocker";
import { type AutoRestartTarget, autoRestartTarget } from "./autoRestartTarget";
import { blockedBy } from "./blockedBy";
import { createAutoRestartNotes } from "./createAutoRestartNotes";

export const AUTO_RESTART_SETTLE_MS = 60_000;

export type AutoRestartSnapshot = AutoRestartInput & { built: string };

type AutoRestartCheckDeps = {
	enabled: () => boolean;
	snapshot: () => Promise<AutoRestartSnapshot>;
	attempted: { get: () => string | undefined; set: (built: string) => void };
	restart: (target: AutoRestartTarget) => Promise<void>;
	log: (message: string) => void;
	report?: (wait: string | undefined) => void;
	now?: () => number;
};

export function createAutoRestartCheck(deps: AutoRestartCheckDeps) {
	const now = deps.now ?? Date.now;
	const notes = createAutoRestartNotes(deps);
	const { note } = notes;

	return async function tick(): Promise<void> {
		if (!deps.enabled()) return note(undefined);
		const snap = await deps.snapshot();
		if (snap.restart.length === 0) return note(undefined);
		const target = autoRestartTarget(snap.restart);
		const blocker = blockedBy(snap, deps.attempted.get());
		if (blocker)
			return note(
				`skipped ${target} restart for v${snap.built}: ${blocker}`,
				blocker,
			);
		const at = now();
		const idleSince = notes.idleSince();
		if (idleSince === undefined) {
			note(
				`${target} restart for v${snap.built} ready; restarting once idle for ${AUTO_RESTART_SETTLE_MS / 1000}s`,
				`idle · restarting within ${AUTO_RESTART_SETTLE_MS / 1000}s`,
			);
			notes.settling(at);
			return;
		}
		if (at - idleSince < AUTO_RESTART_SETTLE_MS) return;
		note(undefined, "restarting");
		await attemptAutoRestart(deps, target, snap.built);
	};
}
