import { readFileSync } from "node:fs";
import type { Options } from "@anthropic-ai/claude-agent-sdk";
import { ensureHooksSettings } from "../ensureHooksSettings";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import { spawnSdkChild } from "./spawnSdkChild";

export type SdkSpawnOpts = {
	prompt?: string;
	cwd?: string;
	sessionId?: string;
	claudeSessionId?: string;
	appendSystemPromptFile?: string;
	model?: string;
};

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
		sessionId: opts.claudeSessionId,
		permissionMode: "auto",
		settings: ensureHooksSettings(),
		pathToClaudeCodeExecutable: executable,
		spawnClaudeCodeProcess: (options) =>
			spawnSdkChild(options, opts.sessionId, control.attach),
		abortController: abort,
		model: opts.model,
		systemPrompt: { type: "preset", preset: "claude_code", append },
	};
}
