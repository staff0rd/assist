import type {
	DrivenSessionOpts,
	SessionProcess,
} from "../../../../../shared/harnessAdapters/types";
import { spawnDrivenSession } from "../spawnDrivenSession";
import { codexSdkDriver } from "./codexSdkDriver";

export function spawnCodexSdk(opts: DrivenSessionOpts): SessionProcess {
	return spawnDrivenSession(opts, codexSdkDriver);
}
