import { isBuildPending } from "../../../watch/isBuildPending";
import { readBuiltVersion } from "../../../watch/readBuiltVersion";
import type { RestartTarget } from "../../../watch/restartRules";
import { requestDaemonReply } from "../../daemon/requestDaemonReply";
import type { AutoUpdateReply } from "../../shared/AutoUpdateLoopState";
import { changedSince } from "./changedSince";
import { pendingRestarts } from "./pendingRestarts";
import { webStartCommit } from "./webStartCommit";

type RestartState = {
	reply?: AutoUpdateReply;
	built: string;
	buildPending: boolean;
	restart: RestartTarget[];
};

export async function readRestartState(
	installDir: string,
): Promise<RestartState> {
	const reply = await requestDaemonReply<AutoUpdateReply>(
		{ type: "auto-update" },
		"auto-update",
	);
	const built = readBuiltVersion(installDir);
	const buildPending = isBuildPending(installDir);
	return {
		reply,
		built,
		buildPending,
		restart: pendingRestarts({
			daemonVersion: reply?.version,
			daemonStartCommit: reply?.startCommit,
			webStartCommit: webStartCommit.value(),
			built,
			buildPending,
			changedSince: changedSince(installDir),
		}),
	};
}
