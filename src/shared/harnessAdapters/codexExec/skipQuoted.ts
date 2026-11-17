export function skipQuoted(src: string, i: number): number {
	const quote = src[i];
	let depth = 0;
	for (let j = i + 1; j < src.length; j++) {
		const c = src[j];
		if (c === "\\") j++;
		else if (quote === "`" && c === "$" && src[j + 1] === "{") {
			depth++;
			j++;
		} else if (depth && c === "}") depth--;
		else if (!depth && c === quote) return j + 1;
		else if (quote !== "`" && c === "\n") return -1;
	}
	return -1;
}
