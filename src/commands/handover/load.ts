import { existsSync, readFileSync } from "node:fs";
import { archive } from "./archive";
import { getHandoverPath } from "./getHandoverPath";
import { parseLoadInput } from "./parseLoadInput";
import { resolveLoadOptions } from "./resolveLoadOptions";
import { SUMMARISE_RECURSION_GUARD } from "./summarise";
import type {
	FindRecentFn,
	LoadContext,
	LoadOptions,
	SummariseFn,
} from "./types";

function loadFromHandover(cwd: string): LoadContext | undefined {
	const handoverPath = getHandoverPath(cwd);
	if (!existsSync(handoverPath)) return undefined;
	const content = readFileSync(handoverPath, "utf-8");
	archive({ cwd });
	return {
		additionalContext: content,
		systemMessage: "Loaded handover from previous session",
	};
}

function loadFromPriorTranscript(
	cwd: string,
	sessionId: string | undefined,
	findRecent: FindRecentFn,
	summariseJsonl: SummariseFn,
): LoadContext | undefined {
	const jsonlPath = findRecent(cwd, sessionId);
	if (!jsonlPath) return undefined;
	const summary = summariseJsonl(jsonlPath);
	if (!summary) return undefined;
	const message = `Previous session: ${summary}`;
	return { additionalContext: message, systemMessage: message };
}

function emit(context: LoadContext): string {
	const json = JSON.stringify({
		hookSpecificOutput: {
			hookEventName: "SessionStart",
			additionalContext: context.additionalContext,
		},
		systemMessage: context.systemMessage,
	});
	console.log(json);
	return json;
}

export async function load(options: LoadOptions = {}): Promise<string | null> {
	const opts = resolveLoadOptions(options);
	if (opts.env[SUMMARISE_RECURSION_GUARD]) return null;

	const input = await parseLoadInput(opts.stdin);
	const cwd = input.cwd ?? opts.cwdFallback;

	const context =
		loadFromHandover(cwd) ??
		loadFromPriorTranscript(
			cwd,
			input.session_id,
			opts.findRecentFn,
			opts.summariseFn,
		);
	return context ? emit(context) : null;
}
