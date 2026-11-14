import { daemonLog } from "../daemonLog";
import { createSdkInterrupt } from "./createSdkInterrupt";
import { createSdkMessageQueue, quoteForLog } from "./createSdkMessageQueue";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import { createSdkTurnEmitter } from "./createSdkTurnEmitter";
import type { SdkTurnStatus } from "./sdkTurnStatus";

export type SdkTurnTracker = ReturnType<typeof createSdkTurnTracker>;

export function createSdkTurnTracker(
	label: string,
	control: SdkSessionControl,
	push: (text: string) => void,
) {
	let busy = false;
	const emit = createSdkTurnEmitter(label, control);
	const queue = createSdkMessageQueue(label, control, push);
	const interrupt = createSdkInterrupt(label, (pending) => {
		control.emit({ kind: "interrupting", pending });
		if (pending) control.emit({ kind: "pending", texts: [] });
	});
	const setStatus = (next: SdkTurnStatus) => {
		busy = next === "running";
		if (next === "waiting") {
			emit.activity(null);
			interrupt.clear();
			busy = queue.flush();
			if (busy) return;
		}
		emit.status(next);
	};
	return {
		setActivity: emit.activity,
		setElapsed: emit.elapsed,
		stopProcessWatch: emit.stopProcessWatch,
		setStatus,
		start: (prompt: string) => {
			busy = true;
			push(prompt);
		},
		send: (text: string) => {
			if (busy) return queue.add(text);
			daemonLog(`${label} sdk message sent: ${quoteForLog(text)}`);
			push(text);
			control.emit({ kind: "pending", texts: [text] });
			setStatus("running");
		},
		dequeue: queue.remove,
		interrupt: (request: () => Promise<void>) =>
			interrupt.request(busy, request),
	};
}
