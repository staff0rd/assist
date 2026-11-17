import { CALL_PLACEHOLDER } from "./replaceLiteralCalls";

const LIST = String.raw`Promise\.all(?:Settled)?\(\[${CALL_PLACEHOLDER}(?:,${CALL_PLACEHOLDER})*,?\]\)`;

export const jsPatterns = {
	ID: String.raw`[A-Za-z_$][\w$]*`,
	DECL: "(?:const|let|var) ?",
	PRINT: String.raw`(?:text|console\.log)`,
	SOURCE: `(?:${CALL_PLACEHOLDER}|${LIST})`,
};
