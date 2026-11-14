import { daemonLog } from "./daemonLog";
import { routedSdk } from "./routedSdk";

export const handleDequeue = routedSdk("dequeue", (sdk, id, d) => {
	const index = Number(d.index);
	daemonLog(`dequeue received: session ${id}, queued message ${index}`);
	sdk.dequeue(index, String(d.text));
});
