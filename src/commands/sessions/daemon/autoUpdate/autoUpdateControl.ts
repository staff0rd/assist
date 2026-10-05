import { existsSync, rmSync, writeFileSync } from "node:fs";
import { daemonPaths } from "../daemonPaths";

let paused: boolean | undefined;
let wake: (() => void) | undefined;

function persist(value: boolean): void {
	try {
		if (value) writeFileSync(daemonPaths.autoUpdatePaused, "");
		else rmSync(daemonPaths.autoUpdatePaused, { force: true });
	} catch {}
}

export const autoUpdateControl = {
	paused: (): boolean => {
		paused ??= existsSync(daemonPaths.autoUpdatePaused);
		return paused;
	},
	setPaused: (value: boolean): void => {
		paused = value;
		persist(value);
		wake?.();
	},
	sleep: (ms: number): Promise<void> =>
		new Promise((resolve) => {
			const done = (): void => {
				clearTimeout(timer);
				if (wake === done) wake = undefined;
				resolve();
			};
			const timer = setTimeout(done, ms);
			wake = done;
		}),
	wake: (): void => wake?.(),
};
