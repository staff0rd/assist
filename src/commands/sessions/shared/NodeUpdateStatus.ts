import type { RestartTarget } from "../../watch/restartRules";
import type { AutoUpdateLoopState } from "./AutoUpdateLoopState";

export type NodeUpdateStatus = {
	nodeName: string;
	installDir: string;
	running: string;
	built: string;
	restart: RestartTarget[];
	daemonReachable: boolean;
	loop: AutoUpdateLoopState;
	history: string[];
};
