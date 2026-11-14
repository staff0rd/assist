import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { routedSdk } from "./routedSdk";

export const handleDequeue = routedSdk("dequeue", (sdk, id, d, client) => {
	const index = Number(d.index);
	daemonLog(`dequeue received: session ${id}, queued message ${index}`);
	const removed = sdk.dequeue(index, String(d.text));
	sendTo(client, { type: "dequeued", requestId: d.requestId, removed });
});
