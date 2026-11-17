import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { daemonLog } from "./daemonLog";

export function yoloEnabled(cwd: string | undefined): boolean {
	try {
		return loadConfigFrom(cwd ?? process.cwd()).sessions?.yolo === true;
	} catch (error) {
		daemonLog(`yolo config unreadable for cwd=${cwd}: ${error}`);
		return false;
	}
}
