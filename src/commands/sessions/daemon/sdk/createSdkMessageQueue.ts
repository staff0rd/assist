import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";

const MAX_LOGGED = 200;

export function quoteForLog(text: string): string {
	return JSON.stringify(
		text.length > MAX_LOGGED ? `${text.slice(0, MAX_LOGGED)}…` : text,
	);
}

/* why: messages sent mid-turn are held here rather than written to the input
 * stream, so the UI can show them as queued until the turn ends and Claude
 * receives them together as its next turn. */
export function createSdkMessageQueue(
	label: string,
	control: SdkSessionControl,
	push: (text: string) => void,
) {
	let queued: string[] = [];
	const publish = (next: string[]) => {
		queued = next;
		control.emit({ kind: "queued", texts: next });
	};
	return {
		add: (text: string) => {
			publish([...queued, text]);
			daemonLog(
				`${label} sdk message queued behind running turn (${queued.length} queued): ${quoteForLog(text)}`,
			);
		},
		flush: (): boolean => {
			if (!queued.length) return false;
			daemonLog(`${label} sdk sending ${queued.length} queued message(s)`);
			const text = queued.join("\n\n");
			publish([]);
			push(text);
			return true;
		},
	};
}
