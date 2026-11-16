import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { daemonLog } from "../daemonLog";

type SdkHandle = NonNullable<SessionProcess["sdk"]>;

export function relaySdkActions(
	label: string,
	current: () => SessionProcess | undefined,
	backgroundTasks: boolean,
): Pick<SdkHandle, "send" | "interrupt" | "dequeue" | "stopTask"> {
	const dropped = (action: string) =>
		daemonLog(
			`${label} sdk ${action} dropped: no driven query is attached to this workflow`,
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
		...(backgroundTasks && {
			stopTask: (taskId: string) => {
				const stopTask = current()?.sdk?.stopTask;
				return stopTask
					? stopTask(taskId)
					: Promise.reject(
							new Error("no driven query with background tasks attached"),
						);
			},
		}),
	};
}
