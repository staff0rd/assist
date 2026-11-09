import { attemptAutoRestart } from "./attemptAutoRestart";
import type {
	AutoRestartSessions,
	AutoRestartSnapshot,
} from "./autoRestartBlocker";
import { type AutoRestartTarget, autoRestartTarget } from "./autoRestartTarget";
import { blockedBy } from "./blockedBy";
import { createAutoRestartNotes } from "./createAutoRestartNotes";
import { autoRestartPreflight } from "./autoRestartPreflight";
import { noteSkipped } from "./noteSkipped";

export { AUTO_RESTART_SETTLE_MS } from "./createAutoRestartNotes";
export type {
	AutoRestartSessions,
	AutoRestartSnapshot,
} from "./autoRestartBlocker";

type AutoRestartCheckDeps = {
	enabled: () => boolean;
	snapshot: () => Promise<AutoRestartSnapshot>;
	freshSessions: () => Promise<AutoRestartSessions | undefined>;
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
	let activity: string | undefined;

	return async function tick(): Promise<void> {
		if (!deps.enabled()) return note(undefined);
		const snap = await deps.snapshot();
		if (snap.restartActivity !== activity) {
			note(undefined);
			activity = snap.restartActivity;
		}
		if (snap.restart.length === 0) return note(undefined);
		const target = autoRestartTarget(snap.restart);
		const blocker = blockedBy(snap, deps.attempted.get(), now());
		if (noteSkipped(note, target, snap.built, blocker)) return;
		if (!notes.settled(now(), target, snap.built)) return;
		const finalBlocker = await autoRestartPreflight(deps, snap, activity, now);
		if (noteSkipped(note, target, snap.built, finalBlocker)) return;
		note(undefined, "restarting");
		await attemptAutoRestart(deps, target, snap.built);
	};
}
