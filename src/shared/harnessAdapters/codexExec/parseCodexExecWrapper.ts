import type { JsLiteral } from "./readJsLiteral";
import { readJsLiteral } from "./readJsLiteral";
import { skipSpace } from "./skipSpace";

export type CodexInnerCall = {
	tool: "exec_command" | "write_stdin";
	args: Record<string, JsLiteral>;
};

const PRAGMA = /^\s*\/\/\s*@exec:[^\n]*(?:\n|$)/;
const CALL = /\btools\s*\.\s*(exec_command|write_stdin)\s*\(/;
const PLACEHOLDER = "__CALL__";
const NAME = String.raw`([A-Za-z_$][\w$]*)`;
const WRAPPERS = [
	/^text\(await __CALL__\);?$/,
	/^text\(\(await __CALL__\)\.output\);?$/,
	/^await __CALL__;?$/,
	new RegExp(
		`^(?:const|let|var) ${NAME}=await __CALL__[; ]text\\((?:\\1|\\1\\.output|JSON\\.stringify\\(\\1\\))\\);?$`,
	),
];

function stripPragmas(input: string): string {
	let rest = input;
	for (let m = PRAGMA.exec(rest); m; m = PRAGMA.exec(rest))
		rest = rest.slice(m[0].length);
	return rest;
}

function normaliseCode(code: string): string {
	return code
		.replace(/\s+/g, " ")
		.trim()
		.replace(/ (?=[^\w$])|(?<=[^\w$]) /g, "");
}

function isRecord(value: JsLiteral): value is Record<string, JsLiteral> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/* why: recognises only a single literal call in a known text(...)/await
 * shape; anything else (dynamic args, extra code) returns null so callers keep
 * the raw wrapper input. */
export function parseCodexExecWrapper(input: string): CodexInnerCall[] | null {
	const code = stripPragmas(input);
	const call = CALL.exec(code);
	if (!call) return null;
	const args = readJsLiteral(code, call.index + call[0].length);
	if (!args || !isRecord(args.value)) return null;
	const close = skipSpace(code, args.end);
	if (code[close] !== ")") return null;
	const wrapper = normaliseCode(
		`${code.slice(0, call.index)}${PLACEHOLDER}${code.slice(close + 1)}`,
	);
	if (!WRAPPERS.some((pattern) => pattern.test(wrapper))) return null;
	return [{ tool: call[1] as CodexInnerCall["tool"], args: args.value }];
}
