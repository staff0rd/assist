import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";

type Listener = (event: SdkSessionEvent) => void;

export function sdkEventListeners() {
	const listeners: Listener[] = [];
	let resumed = false;
	return {
		onEvent: (listener: Listener) => {
			listeners.push(listener);
			/* why: a resume can complete before the daemon wires the session's
			 * listeners, and a missed resumed event leaves the composer locked. */
			if (resumed) listener({ kind: "resumed" });
		},
		emit: (event: SdkSessionEvent) => {
			if (event.kind === "resumed") resumed = true;
			for (const listener of listeners) listener(event);
		},
	};
}
