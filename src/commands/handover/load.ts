import { existsSync, readFileSync } from "node:fs";
import { archive } from "./archive";
import { getHandoverPath } from "./getHandoverPath";
import { parseLoadInput } from "./parseLoadInput";
import { resolveLoadOptions } from "./resolveLoadOptions";
import { SUMMARISE_RECURSION_GUARD } from "./summarise";
import type { LoadContext, LoadOptions } from "./types";

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

	const context = loadFromHandover(cwd);
	return context ? emit(context) : null;
}
