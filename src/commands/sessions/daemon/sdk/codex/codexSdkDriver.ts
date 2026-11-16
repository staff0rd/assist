import { Codex } from "@openai/codex-sdk";
import { daemonLog } from "../../daemonLog";
import { prepareCodexLaunch } from "../../prepareCodexLaunch";
import type { DrivenSessionDriver } from "../DrivenSessionDriver";
import { awaitCodexResume } from "./awaitCodexResume";
import { codexSdkOptions } from "./codexSdkOptions";
import { codexTurnEvents } from "./codexTurnEvents";
import { recordCodexTurnUsage } from "./recordCodexTurnUsage";
import { withCodexTurnUsage } from "./withCodexTurnUsage";

export const codexSdkDriver: DrivenSessionDriver = {
	harness: "codex-sdk",
	start: ({ opts, label, abort, control, input }) => {
		prepareCodexLaunch(opts.cwd);
		const options = codexSdkOptions(opts);
		daemonLog(
			`${label} codex sdk thread starting: codex ${options.codex.codexPathOverride ?? "bundled"}, thread ${opts.resumeId ?? "new"}, sandbox ${options.thread.sandboxMode}, cwd ${opts.cwd ?? process.cwd()}`,
		);
		const codex = new Codex(options.codex);
		const thread = opts.resumeId
			? codex.resumeThread(opts.resumeId, options.thread)
			: codex.startThread(options.thread);
		if (opts.resumeId) awaitCodexResume(label, opts.resumeId, control);
		const turns = codexTurnEvents(
			input,
			async (text, signal) =>
				withCodexTurnUsage(
					(
						await thread.runStreamed(text, {
							signal: AbortSignal.any([abort.signal, signal]),
						})
					).events,
					(usage) =>
						void recordCodexTurnUsage(label, opts.sessionId, thread.id, usage),
				),
			label,
		);
		return { events: turns.events, interrupt: turns.interrupt };
	},
};
