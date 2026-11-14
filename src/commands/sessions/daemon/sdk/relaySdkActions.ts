import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";

type SdkHandle = NonNullable<SessionProcess["sdk"]>;

export function relaySdkActions(
	label: string,
	current: () => SessionProcess | undefined,
): Pick<SdkHandle, "send" | "interrupt" | "dequeue" | "stopTask"> {
	const dropped = (action: string) =>
		daemonLog(
			`${label} sdk ${action} dropped: no Claude (SDK) query is attached to this workflow`,
		);
	return {
		send: (text) => {
			const sdk = current()?.sdk;
			return sdk ? sdk.send(text) : dropped("message");
		},
		interrupt: () => {
			const sdk = current()?.sdk;
			return sdk ? sdk.interrupt() : dropped("interrupt");
		},
		dequeue: (index, text) => {
			const sdk = current()?.sdk;
			if (sdk) return sdk.dequeue(index, text);
			dropped("dequeue");
			return false;
		},
		stopTask: (taskId) => {
			const sdk = current()?.sdk;
			return sdk
				? sdk.stopTask(taskId)
				: Promise.reject(new Error("no Claude (SDK) query attached"));
		},
	};
}
