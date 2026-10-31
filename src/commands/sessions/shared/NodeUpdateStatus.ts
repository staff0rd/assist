import type { RestartTarget } from "../../watch/restartRules";
import type { AutoUpdateLoopState } from "./AutoUpdateLoopState";
import type { ExtensionUpdateStatus } from "./ExtensionUpdateStatus";

export type NodeUpdateStatus = {
	nodeName: string;
	installDir: string;
	running: string;
	built: string;
	restart: RestartTarget[];
	daemonReachable: boolean;
	loop: AutoUpdateLoopState;
	history: string[];
	extension?: ExtensionUpdateStatus;
};
