import { readFileSync } from "node:fs";
import type { Options } from "@anthropic-ai/claude-agent-sdk";
import { ensureHooksSettings } from "../ensureHooksSettings";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkSpawnOpts } from "./SdkSpawnOpts";
import { spawnSdkChild } from "./spawnSdkChild";

export type { SdkSpawnOpts };

export function sdkQueryOptions(
	opts: SdkSpawnOpts,
	executable: string,
	abort: AbortController,
	control: SdkSessionControl,
): Options {
	const append = opts.appendSystemPromptFile
		? readFileSync(opts.appendSystemPromptFile, "utf8")
		: undefined;
	return {
		cwd: opts.cwd,
		...(opts.resumeId
			? { resume: opts.resumeId }
			: { sessionId: opts.claudeSessionId }),
		permissionMode: "auto",
		settings: ensureHooksSettings(),
		pathToClaudeCodeExecutable: executable,
		spawnClaudeCodeProcess: (options) =>
			spawnSdkChild(options, opts, control.attach),
		abortController: abort,
		model: opts.model,
		systemPrompt: { type: "preset", preset: "claude_code", append },
	};
}
