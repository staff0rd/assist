import type { AutoUpdateReply } from "../../shared/AutoUpdateLoopState";
import { ASSIST_VERSION } from "../buildHello";
import { autoUpdateState } from "./autoUpdateState";

export function autoUpdateReply(): AutoUpdateReply {
	return {
		type: "auto-update",
		version: ASSIST_VERSION,
		startCommit: autoUpdateState.startCommit(),
		loop: autoUpdateState.loop(),
	};
}
