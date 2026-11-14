import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";

export type SdkTurnControls = {
	send: (text: string) => void;
	interrupt: () => void;
	dequeue: (index: number, text: string) => boolean;
	stopTask: (taskId: string) => Promise<void>;
};

export function sdkSessionHandle(label: string) {
	const listeners: ((event: SdkSessionEvent) => void)[] = [];
	let turn: SdkTurnControls | undefined;
	let prefixer: (() => string) | undefined;
	const unbound = (action: string) =>
		daemonLog(`${label} sdk ${action} dropped: query not started`);
	const handle: NonNullable<SessionProcess["sdk"]> = {
		onEvent: (listener) => listeners.push(listener),
		send: (text) => (turn ? turn.send(text) : unbound("message")),
		interrupt: () => (turn ? turn.interrupt() : unbound("interrupt")),
		dequeue: (index, text) => {
			if (turn) return turn.dequeue(index, text);
			unbound("dequeue");
			return false;
		},
		stopTask: (taskId) =>
			turn
				? turn.stopTask(taskId)
				: Promise.reject(new Error("query not started")),
		setPrefix: (provider) => {
			prefixer = provider;
		},
	};
	return {
		handle,
		emit: (event: SdkSessionEvent) => {
			for (const listener of listeners) listener(event);
		},
		/* why: held shell results join a message only as it reaches Claude, so a
		 * message queued mid-turn still picks up output that finished after it. */
		prefix: (text: string): string => {
			const blocks = prefixer?.();
			return blocks ? `${blocks}\n\n${text}` : text;
		},
		bind: (controls: SdkTurnControls) => {
			turn = controls;
		},
	};
}
