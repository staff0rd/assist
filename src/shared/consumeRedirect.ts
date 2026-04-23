import { tmpdir } from "node:os";
import type { parse } from "shell-quote";
import { isRedirectTargetAllowed } from "./isRedirectTargetAllowed";

type Tokens = ReturnType<typeof parse>;

export type StepResult =
	| { ok: true; nextIndex: number }
	| { ok: false; error: string };

/** Consume a `>` or `>>` op plus its target from tokens; pops a leading fd digit from current. */
export function consumeRedirect(
	tokens: Tokens,
	opIndex: number,
	current: string[],
): StepResult {
	const target = tokens[opIndex + 1];
	if (typeof target !== "string") {
		return { ok: false, error: "unable to parse" };
	}
	if (!isRedirectTargetAllowed(target, tmpdir())) {
		return {
			ok: false,
			error: `redirect target '${target}' is outside the OS temp directory`,
		};
	}
	if (current.length > 0 && /^\d$/.test(current[current.length - 1])) {
		current.pop();
	}
	return { ok: true, nextIndex: opIndex + 1 };
}
