import type { CodexInnerCall } from "./CodexInnerCall";
import { isGlueBody, isGlueStatement } from "./isGlueStatement";
import { jsPatterns } from "./jsPatterns";
import { normaliseCode } from "./normaliseCode";
import { replaceLiteralCalls } from "./replaceLiteralCalls";

const { DECL, ID, PRINT, SOURCE } = jsPatterns;

type ClassifiedStatement =
	| { kind: "call"; calls: CodexInnerCall[]; binds: string[] }
	| { kind: "glue" }
	| { kind: "raw" };

const AWAITED = `await ${SOURCE}`;
const PRINTED = new RegExp(
	`^(?:(?:await )?${SOURCE}|${PRINT}\\((?:${AWAITED}|\\(${AWAITED}\\)(?:\\.output)?|JSON\\.stringify\\(${AWAITED}\\))\\))$`,
);
const ASSIGNED = new RegExp(
	`^${DECL}(${ID}|\\{[^{}]*\\}|\\[[^\\[\\]]*\\])=${AWAITED}$`,
);
const LOOPED = new RegExp(`^for\\(${DECL}(${ID}) of ${AWAITED}\\)(.+)$`);
const PATTERN_NAME = new RegExp(`^(?:\\.\\.\\.)?(?:${ID}:)?(${ID})$`);

function boundNames(target: string): string[] | null {
	if (!/^[{[]/.test(target)) return [target];
	const names = target.slice(1, -1).split(",").filter(Boolean);
	const matches = names.map((name) => PATTERN_NAME.exec(name)?.[1]);
	return matches.every((name) => name !== undefined)
		? (matches as string[])
		: null;
}

function callBinds(code: string, bound: ReadonlySet<string>): string[] | null {
	if (PRINTED.test(code)) return [];
	const assigned = ASSIGNED.exec(code);
	if (assigned) return boundNames(assigned[1]);
	const looped = LOOPED.exec(code);
	if (looped && isGlueBody(looped[2], new Set([...bound, looped[1]])))
		return [];
	return null;
}

export function classifyStatement(
	source: string,
	bound: ReadonlySet<string>,
): ClassifiedStatement {
	const replaced = replaceLiteralCalls(source);
	if (!replaced) return { kind: "raw" };
	const code = normaliseCode(replaced.code);
	if (!replaced.calls.length)
		return isGlueStatement(code, bound) ? { kind: "glue" } : { kind: "raw" };
	const binds = callBinds(code, bound);
	return binds
		? { kind: "call", calls: replaced.calls, binds }
		: { kind: "raw" };
}
