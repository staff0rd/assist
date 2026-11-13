import { type Query, query } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";
import { resolveClaudeExecutable } from "../resolveClaudeExecutable";
import type { createSdkInput } from "./createSdkInput";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import { runSdkQuery } from "./runSdkQuery";
import { type SdkSpawnOpts, sdkQueryOptions } from "./sdkQueryOptions";

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
			interrupt: () =>
				turn.interrupt(async () => {
					await messages.interrupt();
				}),
		});
		await runSdkQuery(messages, opts.sessionId, control, turn);
	} catch (error) {
		daemonLog(
			`${label} sdk query not started: ${error instanceof Error ? error.message : String(error)}`,
		);
		control.exit(1);
	}
}

function awaitResume(
	label: string,
	messages: Query,
	control: SdkSessionControl,
): void {
	messages.initializationResult().then(
		() => {
			daemonLog(`${label} sdk resume complete`);
			control.emit({ kind: "resumed" });
		},
		(error: unknown) =>
			daemonLog(
				`${label} sdk resume did not complete: ${error instanceof Error ? error.message : String(error)}`,
			),
	);
}
