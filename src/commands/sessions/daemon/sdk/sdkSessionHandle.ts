import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";
import { sdkEventListeners } from "./sdkEventListeners";

export type SdkTurnControls = {
	send: (text: string) => void;
	interrupt: () => void;
	dequeue: (index: number, text: string) => boolean;
	stopTask?: (taskId: string) => Promise<void>;
};

export function sdkSessionHandle(label: string, backgroundTasks: boolean) {
	const events = sdkEventListeners();
	let turn: SdkTurnControls | undefined;
	let prefixer: (() => string) | undefined;
	const unbound = (action: string) =>
		daemonLog(`${label} sdk ${action} dropped: query not started`);
	const handle: NonNullable<SessionProcess["sdk"]> = {
		onEvent: events.onEvent,
		send: (text) => (turn ? turn.send(text) : unbound("message")),
		interrupt: () => (turn ? turn.interrupt() : unbound("interrupt")),
		dequeue: (index, text) => {
			if (turn) return turn.dequeue(index, text);
			unbound("dequeue");
			return false;
		},
		...(backgroundTasks && {
			stopTask: (taskId: string) =>
				turn?.stopTask
					? turn.stopTask(taskId)
					: Promise.reject(new Error("query not started")),
		}),
		setPrefix: (provider) => {
			prefixer = provider;
		},
	};
	return {
		handle,
		emit: events.emit,
		/* why: held shell results join a message only as it reaches the agent, so a
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
