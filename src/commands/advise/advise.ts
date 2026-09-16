import { readStdin } from "../../lib/readStdin";
import { adviceContextFor } from "./adviceContextFor";
import { composeAdvice } from "./composeAdvice";
import { explainAdvice } from "./explainAdvice";

type AdviseOptions = {
	hook?: boolean;
	explain?: boolean;
	stdin?: () => Promise<string>;
	cwdFallback?: string;
};

async function hookCwd(options: AdviseOptions): Promise<string | undefined> {
	const read = options.stdin ?? (process.stdin.isTTY ? undefined : readStdin);
	if (!read) return undefined;
	try {
		const raw = await read();
		if (!raw.trim()) return undefined;
		return (JSON.parse(raw) as { cwd?: string }).cwd;
	} catch {
		return undefined;
	}
}

export async function advise(options: AdviseOptions = {}): Promise<string> {
	const fallback = options.cwdFallback ?? process.cwd();
	const cwd = options.hook ? ((await hookCwd(options)) ?? fallback) : fallback;
	const context = adviceContextFor(cwd);

	if (options.explain) {
		const explanation = explainAdvice(context);
		console.log(explanation);
		return explanation;
	}

	const markdown = composeAdvice(context);
	if (!markdown) return "";

	const output = options.hook
		? JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "SessionStart",
					additionalContext: markdown,
				},
			})
		: markdown;
	console.log(output);
	return output;
}
