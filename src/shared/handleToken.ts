import type { parse } from "shell-quote";
import { consumeHeredoc } from "./consumeHeredoc";
import { consumeInputRedirect } from "./consumeInputRedirect";
import { consumeRedirect, type StepResult } from "./consumeRedirect";

type Tokens = ReturnType<typeof parse>;

const SEPARATOR_OPS = new Set(["|", "&&", "||", ";"]);

const OUTPUT_REDIRECT_OPS = new Set([">", ">>"]);

const HEREDOC_OPS = new Set(["<<", "<<-"]);

const INPUT_REDIRECT_OP = "<";

const UNPARSEABLE = { ok: false, error: "unable to parse" } as const;

type Token = Tokens[number];

export function handleToken(
	tokens: Tokens,
	i: number,
	groups: string[][],
): StepResult {
	const token = tokens[i];
	const op = getOp(token);
	if (op === undefined) return appendWord(token, groups, i);
	if (op === "glob") {
		groups[groups.length - 1].push((token as { pattern: string }).pattern);
		return { ok: true, nextIndex: i };
	}
	if (SEPARATOR_OPS.has(op)) {
		groups.push([]);
		return { ok: true, nextIndex: i };
	}
	if (OUTPUT_REDIRECT_OPS.has(op)) {
		return consumeRedirect(tokens, i, groups[groups.length - 1]);
	}
	if (HEREDOC_OPS.has(op)) {
		return consumeHeredoc(tokens, i, groups[groups.length - 1]);
	}
	if (op === INPUT_REDIRECT_OP) {
		return consumeInputRedirect(tokens, i, groups[groups.length - 1]);
	}
	return UNPARSEABLE;
}

function getOp(token: Token): string | undefined {
	return typeof token === "object" && token !== null && "op" in token
		? (token as { op: string }).op
		: undefined;
}

function appendWord(token: Token, groups: string[][], i: number): StepResult {
	if (typeof token !== "string") return UNPARSEABLE;
	groups[groups.length - 1].push(token);
	return { ok: true, nextIndex: i };
}
