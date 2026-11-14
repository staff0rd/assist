import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";

export type SdkTurnControls = {
	send: (text: string) => void;
	interrupt: () => void;
	stopTask: (taskId: string) => Promise<void>;
};

export function sdkSessionHandle(label: string) {
	const listeners: ((event: SdkSessionEvent) => void)[] = [];
	let turn: SdkTurnControls | undefined;
	const unbound = (action: string) =>
		daemonLog(`${label} sdk ${action} dropped: query not started`);
	const handle: NonNullable<SessionProcess["sdk"]> = {
		onEvent: (listener) => listeners.push(listener),
		send: (text) => (turn ? turn.send(text) : unbound("message")),
		interrupt: () => (turn ? turn.interrupt() : unbound("interrupt")),
		stopTask: (taskId) =>
			turn
				? turn.stopTask(taskId)
				: Promise.reject(new Error("query not started")),
	};
	return {
		handle,
		emit: (event: SdkSessionEvent) => {
			for (const listener of listeners) listener(event);
		},
		bind: (controls: SdkTurnControls) => {
			turn = controls;
		},
	};
}
