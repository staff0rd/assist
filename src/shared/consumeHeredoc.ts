import type { parse } from "shell-quote";
import { popFdPrefix, type StepResult } from "./consumeRedirect";

type Tokens = ReturnType<typeof parse>;

export function consumeHeredoc(
	tokens: Tokens,
	opIndex: number,
	current: string[],
): StepResult {
	const delimiter = tokens[opIndex + 1];
	if (typeof delimiter !== "string") {
		return { ok: false, error: "unable to parse" };
	}
	popFdPrefix(current);
	return { ok: true, nextIndex: opIndex + 1 };
}
