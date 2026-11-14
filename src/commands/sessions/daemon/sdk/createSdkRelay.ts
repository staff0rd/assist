import type {
	SdkSessionEvent,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";

type SdkHandle = NonNullable<SessionProcess["sdk"]>;

export function createSdkRelay(label: string) {
	const listeners: ((event: SdkSessionEvent) => void)[] = [];
	let current: SessionProcess | undefined;
	const emit = (event: SdkSessionEvent) => {
		for (const listener of listeners) listener(event);
	};
	const dropped = (action: string) =>
		daemonLog(
			`${label} sdk ${action} dropped: no Claude (SDK) query is attached to this workflow`,
		);
	const detach = (query: SessionProcess) => {
		if (current !== query) return;
		current = undefined;
		daemonLog(`${label} sdk query detached from workflow`);
		emit({ kind: "activity", text: null });
		emit({ kind: "elapsed", seconds: null });
		emit({ kind: "process", process: null });
		emit({ kind: "queued", texts: [] });
		emit({ kind: "background", tasks: [] });
		emit({ kind: "interrupting", pending: false });
	};
	const handle: SdkHandle = {
		onEvent: (listener) => listeners.push(listener),
		send: (text) =>
			current?.sdk ? current.sdk.send(text) : dropped("message"),
		interrupt: () =>
			current?.sdk ? current.sdk.interrupt() : dropped("interrupt"),
		stopTask: (taskId) =>
			current?.sdk
				? current.sdk.stopTask(taskId)
				: Promise.reject(new Error("no Claude (SDK) query attached")),
		attach: (query, idle) => {
			current = query;
			daemonLog(
				`${label} sdk query attached to workflow${idle ? ", awaiting input" : ""}`,
			);
			query.sdk?.onEvent((event) => {
				if (current === query) emit(event);
			});
			query.onExit(() => detach(query));
			if (idle) emit({ kind: "status", status: "waiting" });
		},
	};
	return { handle, current: () => current };
}
