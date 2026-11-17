import type { JsRead } from "./JsRead";
import { skipSpace } from "./skipSpace";

export function readList<T>(
	src: string,
	start: number,
	close: string,
	readItem: (i: number) => JsRead<T> | null,
): JsRead<T[]> | null {
	const items: T[] = [];
	let i = skipSpace(src, start + 1);
	while (src[i] !== close) {
		const item = readItem(i);
		if (!item) return null;
		items.push(item.value);
		i = skipSpace(src, item.end);
		if (src[i] === ",") i = skipSpace(src, i + 1);
		else if (src[i] !== close) return null;
	}
	return { value: items, end: i + 1 };
}
