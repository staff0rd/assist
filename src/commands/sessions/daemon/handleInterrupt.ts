import { daemonLog } from "./daemonLog";
import { routedSdk } from "./routedSdk";

export const handleInterrupt = routedSdk("interrupt", (sdk, id) => {
	daemonLog(`interrupt received: session ${id}`);
	sdk.interrupt();
});
