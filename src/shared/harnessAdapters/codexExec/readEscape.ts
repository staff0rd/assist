import type { JsRead } from "./JsRead";

const SIMPLE_ESCAPES: Record<string, string> = {
	n: "\n",
	t: "\t",
	r: "\r",
	b: "\b",
	f: "\f",
	v: "\v",
};

export function readEscape(src: string, i: number): JsRead<string> | null {
	const c = src[i];
	if (c === undefined) return null;
	if (c in SIMPLE_ESCAPES) return { value: SIMPLE_ESCAPES[c], end: i + 1 };
	if (c === "0" && !/\d/.test(src[i + 1] ?? ""))
		return { value: "\0", end: i + 1 };
	if (/\d/.test(c)) return null;
	if (c === "\r")
		return { value: "", end: src[i + 1] === "\n" ? i + 2 : i + 1 };
	if (c === "\n") return { value: "", end: i + 1 };
	if (c !== "x" && c !== "u") return { value: c, end: i + 1 };
	const hex = (
		c === "x" ? /^[\da-fA-F]{2}/ : /^(?:[\da-fA-F]{4}|\{[\da-fA-F]{1,6}\})/
	).exec(src.slice(i + 1));
	if (!hex) return null;
	const code = Number.parseInt(hex[0].replace(/[{}]/g, ""), 16);
	if (code > 0x10ffff) return null;
	return { value: String.fromCodePoint(code), end: i + 1 + hex[0].length };
}
