import type { JsRead } from "./JsRead";
import { readJsString } from "./readJsString";
import { readList } from "./readList";
import { skipSpace } from "./skipSpace";
import { readKey } from "./readKey";

export type JsLiteral =
	| string
	| number
	| boolean
	| null
	| JsLiteral[]
	| { [key: string]: JsLiteral };

const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?(?![\w$])/;
const KEYWORD = /^(?:true|false|null)(?![\w$])/;
const KEYWORDS: Record<string, boolean | null> = {
	true: true,
	false: false,
	null: null,
};

function readEntry(src: string, i: number): JsRead<[string, JsLiteral]> | null {
	const key = readKey(src, i);
	if (!key) return null;
	const colon = skipSpace(src, key.end);
	if (src[colon] !== ":") return null;
	const value = readJsLiteral(src, colon + 1);
	return value && { value: [key.value, value.value], end: value.end };
}

/* why: wrapper code is only ever read, never evaluated, so anything beyond
 * plain literals (identifiers, calls, spreads, interpolation) yields null. */
export function readJsLiteral(
	src: string,
	start: number,
): JsRead<JsLiteral> | null {
	const i = skipSpace(src, start);
	const c = src[i];
	if (c === '"' || c === "'" || c === "`") return readJsString(src, i);
	if (c === "[") return readList(src, i, "]", (at) => readJsLiteral(src, at));
	if (c === "{") {
		const entries = readList(src, i, "}", (at) => readEntry(src, at));
		return (
			entries && { value: Object.fromEntries(entries.value), end: entries.end }
		);
	}
	const rest = src.slice(i);
	const keyword = KEYWORD.exec(rest);
	if (keyword)
		return { value: KEYWORDS[keyword[0]], end: i + keyword[0].length };
	const number = NUMBER.exec(rest);
	return number
		? { value: Number(number[0]), end: i + number[0].length }
		: null;
}
