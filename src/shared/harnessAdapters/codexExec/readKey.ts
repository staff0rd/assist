import type { JsRead } from "./JsRead";
import { readJsString } from "./readJsString";

const KEY = /^(?:[A-Za-z_$][\w$]*|\d+)/;

export function readKey(src: string, i: number): JsRead<string> | null {
	if (src[i] === '"' || src[i] === "'") return readJsString(src, i);
	const match = KEY.exec(src.slice(i));
	return match ? { value: match[0], end: i + match[0].length } : null;
}
