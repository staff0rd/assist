import { getInstallDir } from "../../../../shared/getInstallDir";
import { readBuiltVersion } from "../../../watch/readBuiltVersion";
import type { AutoUpdateReply } from "../../shared/AutoUpdateLoopState";
import { ASSIST_VERSION } from "../buildHello";
import { autoUpdateControl } from "./autoUpdateControl";
import { autoUpdateState } from "./autoUpdateState";

export function autoUpdateReply(requestId?: unknown): AutoUpdateReply {
	return {
		type: "auto-update",
		version: ASSIST_VERSION,
		built: readBuiltVersion(getInstallDir()),
		startCommit: autoUpdateState.startCommit(),
		loop: { ...autoUpdateState.loop(), paused: autoUpdateControl.paused() },
		...(typeof requestId === "string" ? { requestId } : {}),
	};
}
