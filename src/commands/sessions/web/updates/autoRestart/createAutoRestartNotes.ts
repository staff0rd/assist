type NoteDeps = {
	log: (message: string) => void;
	report?: (wait: string | undefined) => void;
};

export function createAutoRestartNotes(deps: NoteDeps) {
	const report = deps.report ?? (() => {});
	let idleSince: number | undefined;
	let lastNote: string | undefined;

	return {
		idleSince: (): number | undefined => idleSince,
		settling: (at: number): void => {
			idleSince = at;
		},
		note: (message: string | undefined, wait?: string): void => {
			if (message !== undefined && message !== lastNote)
				deps.log(`auto-restart: ${message}`);
			lastNote = message;
			idleSince = undefined;
			report(wait);
		},
	};
}
