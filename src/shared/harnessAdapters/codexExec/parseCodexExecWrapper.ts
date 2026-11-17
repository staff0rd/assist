import type { CodexInnerCall } from "./CodexInnerCall";
import { classifyStatement } from "./classifyStatement";
import { splitStatements } from "./splitStatements";

type CodexExecPart =
	| { kind: "call"; call: CodexInnerCall }
	| { kind: "raw"; source: string };

export function parseCodexExecWrapper(input: string): CodexExecPart[] | null {
	const spans = splitStatements(input);
	if (!spans) return null;
	const bound = new Set<string>();
	const parts: CodexExecPart[] = [];
	const raw = { start: -1, end: -1 };
	const flushRaw = () => {
		if (raw.start !== -1)
			parts.push({ kind: "raw", source: input.slice(raw.start, raw.end) });
		raw.start = -1;
	};
	for (const span of spans) {
		const statement = classifyStatement(
			input.slice(span.start, span.end),
			bound,
		);
		if (statement.kind === "raw") {
			if (raw.start === -1) raw.start = span.start;
			raw.end = span.end;
		}
		if (statement.kind !== "call") continue;
		flushRaw();
		for (const name of statement.binds) bound.add(name);
		for (const call of statement.calls) parts.push({ kind: "call", call });
	}
	flushRaw();
	return parts.some((part) => part.kind === "call") ? parts : null;
}
