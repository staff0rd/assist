import { readStdin } from "../../lib/readStdin";
import { adviceContextFor } from "./adviceContextFor";
import { adviceHookPayload } from "./adviceHookPayload";
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

	if (options.explain) {
		const explanation = explainAdvice(adviceContextFor(cwd));
		console.log(explanation);
		return explanation;
	}

	if (options.hook) {
		const payload = adviceHookPayload(cwd);
		if (!payload) return "";
		const output = JSON.stringify(payload);
		console.log(output);
		return output;
	}

	const markdown = composeAdvice(adviceContextFor(cwd));
	if (!markdown) return "";
	console.log(markdown);
	return markdown;
}
