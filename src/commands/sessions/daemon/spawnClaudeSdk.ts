import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import { createSdkInput } from "./sdk/createSdkInput";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { createSdkTurnTracker } from "./sdk/createSdkTurnTracker";
import type { SdkSpawnOpts } from "./sdk/sdkQueryOptions";
import { startSdkQuery } from "./sdk/startSdkQuery";
import { refuseMissingCwd } from "./spawnPty";

export function spawnClaudeSdk(opts: SdkSpawnOpts): SessionProcess {
	refuseMissingCwd(opts.cwd, opts.sessionId);
	const abort = new AbortController();
	const control = createSdkSessionProcess(opts.sessionId, abort);
	const input = createSdkInput();
	const turn = createSdkTurnTracker(
		`session ${opts.sessionId ?? "?"}`,
		control,
		input.push,
	);
	if (opts.prompt) turn.start(opts.prompt);
	abort.signal.addEventListener("abort", input.close);
	void startSdkQuery(opts, abort, control, turn, input.messages);
	return control.process;
}
