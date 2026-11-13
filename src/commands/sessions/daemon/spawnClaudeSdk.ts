import { query } from "@anthropic-ai/claude-agent-sdk";
import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import { daemonLog } from "./daemonLog";
import { resolveClaudeExecutable } from "./resolveClaudeExecutable";
import { createSdkInput } from "./sdk/createSdkInput";
import {
	createSdkSessionProcess,
	type SdkSessionControl,
} from "./sdk/createSdkSessionProcess";
import { runSdkQuery } from "./sdk/runSdkQuery";
import { type SdkSpawnOpts, sdkQueryOptions } from "./sdk/sdkQueryOptions";
import { refuseMissingCwd } from "./spawnPty";

export function spawnClaudeSdk(opts: SdkSpawnOpts): SessionProcess {
	refuseMissingCwd(opts.cwd, opts.sessionId);
	const abort = new AbortController();
	const control = createSdkSessionProcess(opts.sessionId, abort);
	const input = createSdkInput();
	if (opts.prompt) input.push(opts.prompt);
	abort.signal.addEventListener("abort", input.close);
	void startQuery(opts, abort, control, input.messages);
	return control.process;
}

async function startQuery(
	opts: SdkSpawnOpts,
	abort: AbortController,
	control: SdkSessionControl,
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
		await runSdkQuery(messages, opts.sessionId, control);
	} catch (error) {
		daemonLog(
			`${label} sdk query not started: ${error instanceof Error ? error.message : String(error)}`,
		);
		control.exit(1);
	}
}
