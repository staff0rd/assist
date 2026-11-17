import type { CodexInnerCall } from "./CodexInnerCall";
import { codexInnerCallView } from "./codexInnerCallView";
import { readJsLiteral } from "./readJsLiteral";
import { skipSpace } from "./skipSpace";

export const CALL_PLACEHOLDER = "__CALL__";

const CALL = /(?<![\w$])tools\s*\.\s*([\w$]+)\s*\(/g;
const TOOLS = /(?<![\w$])tools(?![\w$])/;
const INNER_TOOLS = new Set(["exec_command", "write_stdin"]);

type Replaced = { code: string; calls: CodexInnerCall[] };

function readCall(src: string, match: RegExpExecArray) {
	if (!INNER_TOOLS.has(match[1])) return null;
	const args = readJsLiteral(src, match.index + match[0].length);
	const value = args?.value;
	if (!args || typeof value !== "object" || !value || Array.isArray(value))
		return null;
	const close = skipSpace(src, args.end);
	if (src[close] !== ")") return null;
	const call = { tool: match[1], args: value } as CodexInnerCall;
	return codexInnerCallView(call) && { call, end: close + 1 };
}

export function replaceLiteralCalls(src: string): Replaced | null {
	const calls: CodexInnerCall[] = [];
	let code = "";
	let last = 0;
	CALL.lastIndex = 0;
	for (let match = CALL.exec(src); match; match = CALL.exec(src)) {
		const read = readCall(src, match);
		if (!read) return null;
		calls.push(read.call);
		code += `${src.slice(last, match.index)}${CALL_PLACEHOLDER}`;
		last = read.end;
		CALL.lastIndex = read.end;
	}
	code += src.slice(last);
	return TOOLS.test(code) ? null : { code, calls };
}
