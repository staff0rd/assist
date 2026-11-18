import { harnessCapability } from "../../../../shared/harnessAdapters/harnessCapability";
import type {
	DrivenSessionOpts,
	SessionProcess,
} from "../../../../shared/harnessAdapters/types";
import { refuseMissingCwd } from "../spawnPty";
import { createSdkInput } from "./createSdkInput";
import { createSdkSessionProcess } from "./createSdkSessionProcess";
import { createSdkTurnTracker } from "./createSdkTurnTracker";
import type { DrivenSessionDriver } from "./DrivenSessionDriver";
import { startDrivenQuery } from "./startDrivenQuery";
import { workflowQueryEnv } from "./workflowQueryEnv";

export function spawnDrivenSession(
	opts: DrivenSessionOpts,
	driver: DrivenSessionDriver,
): SessionProcess {
	refuseMissingCwd(opts.cwd, opts.sessionId);
	const label = `session ${opts.sessionId ?? "?"}`;
	const backgroundTasks = harnessCapability(
		driver.harness,
		"tasks.background",
	).supported;
	const abort = new AbortController();
	const control = createSdkSessionProcess(opts.sessionId, abort, {
		backgroundTasks,
	});
	const input = createSdkInput();
	const turn = createSdkTurnTracker(label, control, input.push);
	if (opts.prompt) turn.start(opts.prompt);
	abort.signal.addEventListener("abort", input.close);
	const context = {
		opts,
		label,
		abort,
		control,
		input: input.messages,
		childEnv: (base: Record<string, string | undefined>) =>
			workflowQueryEnv(base, opts.sessionId, opts.launcherEnv, opts.cwd),
	};
	startDrivenQuery(driver, context, turn, backgroundTasks);
	return control.process;
}
