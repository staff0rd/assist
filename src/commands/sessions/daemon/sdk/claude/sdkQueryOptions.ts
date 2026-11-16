import { readFileSync } from "node:fs";
import type { Options } from "@anthropic-ai/claude-agent-sdk";
import { ensureHooksSettings } from "../../ensureHooksSettings";
import type { DrivenSessionContext } from "../DrivenSessionDriver";
import { spawnSdkChild } from "./spawnSdkChild";

export function sdkQueryOptions(
	context: DrivenSessionContext,
	executable: string,
): Options {
	const { opts, abort, control } = context;
	const append = opts.appendSystemPromptFile
		? readFileSync(opts.appendSystemPromptFile, "utf8")
		: undefined;
	return {
		cwd: opts.cwd,
		...(opts.resumeId
			? { resume: opts.resumeId }
			: { sessionId: opts.conversationId }),
		permissionMode: "auto",
		settings: ensureHooksSettings(),
		pathToClaudeCodeExecutable: executable,
		spawnClaudeCodeProcess: (options) =>
			spawnSdkChild(options, context, control.attach),
		abortController: abort,
		model: opts.model,
		promptSuggestions: true,
		systemPrompt: { type: "preset", preset: "claude_code", append },
	};
}
