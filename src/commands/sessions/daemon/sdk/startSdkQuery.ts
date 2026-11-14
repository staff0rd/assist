import { query } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";
import { resolveClaudeExecutable } from "../resolveClaudeExecutable";
import type { createSdkInput } from "./createSdkInput";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import { runSdkQuery } from "./runSdkQuery";
import { type SdkSpawnOpts, sdkQueryOptions } from "./sdkQueryOptions";
import { awaitResume } from "./awaitResume";

export async function startSdkQuery(
	opts: SdkSpawnOpts,
	abort: AbortController,
	control: SdkSessionControl,
	turn: SdkTurnTracker,
	prompt: ReturnType<typeof createSdkInput>["messages"],
): Promise<void> {
	const label = `session ${opts.sessionId ?? "?"}`;
	try {
		const executable = resolveClaudeExecutable();
		daemonLog(
			`${label} sdk query starting: claude ${executable}, claude session ${opts.claudeSessionId ?? "unassigned"}, permission mode auto, cwd ${opts.cwd ?? process.cwd()}`,
		);
		const messages = query({
			prompt,
			options: sdkQueryOptions(opts, executable, abort, control),
		});
		if (opts.resumeId) awaitResume(label, messages, control);
		control.bind({
			send: turn.send,
			dequeue: turn.dequeue,
			interrupt: () =>
				turn.interrupt(async () => {
					await messages.interrupt();
				}),
			stopTask: (taskId) => messages.stopTask(taskId),
		});
		await runSdkQuery(messages, opts.sessionId, control, turn);
	} catch (error) {
		daemonLog(
			`${label} sdk query not started: ${error instanceof Error ? error.message : String(error)}`,
		);
		control.exit(1);
	}
}
