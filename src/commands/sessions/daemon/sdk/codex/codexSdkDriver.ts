import { Codex } from "@openai/codex-sdk";
import { daemonLog } from "../../daemonLog";
import { prepareCodexLaunch } from "../../prepareCodexLaunch";
import type { DrivenSessionDriver } from "../DrivenSessionDriver";
import { emitClearedSdkState } from "../emitClearedSdkState";
import { awaitCodexResume } from "./awaitCodexResume";
import { codexSdkOptions } from "./codexSdkOptions";
import { codexTurnEvents } from "./codexTurnEvents";
import { recordCodexTurnUsage } from "./recordCodexTurnUsage";
import { withCodexTurnUsage } from "./withCodexTurnUsage";

/* why: the Codex SDK has no built-in /clear, so the driver swaps in a fresh
 * thread; its first turn's thread.started rebinds the session's conversation. */
async function* noEvents(): AsyncGenerator<never> {}

export const codexSdkDriver: DrivenSessionDriver = {
	harness: "codex-sdk",
	start: ({ opts, label, abort, control, input, childEnv }) => {
		prepareCodexLaunch(opts.cwd);
		const options = codexSdkOptions(opts, childEnv);
		daemonLog(
			`${label} codex sdk thread starting: codex ${options.codex.codexPathOverride ?? "bundled"}, thread ${opts.resumeId ?? "new"}, sandbox ${options.thread.sandboxMode}, cwd ${opts.cwd ?? process.cwd()}`,
		);
		const codex = new Codex(options.codex);
		let thread = opts.resumeId
			? codex.resumeThread(opts.resumeId, options.thread)
			: codex.startThread(options.thread);
		if (opts.resumeId) awaitCodexResume(label, opts.resumeId, control);
		const turns = codexTurnEvents(
			input,
			async (text, signal) => {
				if (text.trim() === "/clear") {
					thread = codex.startThread(options.thread);
					daemonLog(`${label} codex sdk /clear: new thread started`);
					emitClearedSdkState(control.emit);
					return noEvents();
				}
				return withCodexTurnUsage(
					(
						await thread.runStreamed(text, {
							signal: AbortSignal.any([abort.signal, signal]),
						})
					).events,
					(usage) =>
						void recordCodexTurnUsage(label, opts.sessionId, thread.id, usage),
				);
			},
			label,
		);
		return { events: turns.events, interrupt: turns.interrupt };
	},
};
