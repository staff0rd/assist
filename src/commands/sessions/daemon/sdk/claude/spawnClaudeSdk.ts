import type {
	DrivenSessionOpts,
	SessionProcess,
} from "../../../../../shared/harnessAdapters/types";
import { spawnDrivenSession } from "../spawnDrivenSession";
import { claudeSdkDriver } from "./claudeSdkDriver";

export function spawnClaudeSdk(opts: DrivenSessionOpts): SessionProcess {
	return spawnDrivenSession(opts, claudeSdkDriver);
}
