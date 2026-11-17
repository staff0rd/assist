import type { JsRead } from "./JsRead";
import { readEscape } from "./readEscape";

export function readJsString(
	src: string,
	start: number,
): JsRead<string> | null {
	const quote = src[start];
	let value = "";
	let i = start + 1;
	while (i < src.length) {
		const c = src[i];
		if (c === quote) return { value, end: i + 1 };
		if (c === "\\") {
			const escape = readEscape(src, i + 1);
			if (!escape) return null;
			value += escape.value;
			i = escape.end;
			continue;
		}
		if (quote === "`" && c === "$" && src[i + 1] === "{") return null;
		if (quote !== "`" && (c === "\n" || c === "\r")) return null;
		value += c;
		i++;
	}
	return null;
}
