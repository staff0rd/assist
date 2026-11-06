import type { AutoRestartTarget } from "./autoRestartTarget";

export const AUTO_RESTART_SETTLE_MS = 60_000;

type NoteDeps = {
	log: (message: string) => void;
	report?: (wait: string | undefined) => void;
};

export function createAutoRestartNotes(deps: NoteDeps) {
	const report = deps.report ?? (() => {});
	let idleSince: number | undefined;
	let lastNote: string | undefined;
	const note = (message: string | undefined, wait?: string): void => {
		if (message !== undefined && message !== lastNote)
			deps.log(`auto-restart: ${message}`);
		lastNote = message;
		idleSince = undefined;
		report(wait);
	};

	return {
		note,
		settled: (
			at: number,
			target: AutoRestartTarget,
			built: string,
		): boolean => {
			if (idleSince !== undefined)
				return at - idleSince >= AUTO_RESTART_SETTLE_MS;
			note(
				`${target} restart for v${built} ready; restarting once idle for ${AUTO_RESTART_SETTLE_MS / 1000}s`,
				`idle · restarting within ${AUTO_RESTART_SETTLE_MS / 1000}s`,
			);
			idleSince = at;
			return false;
		},
	};
}
