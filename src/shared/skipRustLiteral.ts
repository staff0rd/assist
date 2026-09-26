const IDENTIFIER_CHAR = /[A-Za-z0-9_]/;
const RAW_PREFIX = /^[bc]?r$/;
const QUOTED_PREFIX = /^[bc]$/;
const ESCAPED_CHAR_MAX_LENGTH = 12;

function skipQuoted(content: string, quote: number): number {
	let cursor = quote + 1;
	while (cursor < content.length) {
		const char = content[cursor];
		if (char === "\\") cursor += 2;
		else if (char === '"') return cursor + 1;
		else cursor++;
	}
	return content.length;
}

function skipRaw(content: string, start: number): number | undefined {
	let hashes = 0;
	while (content[start + hashes] === "#") hashes++;
	const quote = start + hashes;
	if (content[quote] !== '"') return undefined;
	const close = content.indexOf(`"${"#".repeat(hashes)}`, quote + 1);
	return close === -1 ? content.length : close + 1 + hashes;
}

function skipCharOrLifetime(content: string, quote: number): number {
	if (content[quote + 1] === "\\") {
		const close = content.indexOf("'", quote + 3);
		const inRange = close !== -1 && close - quote <= ESCAPED_CHAR_MAX_LENGTH;
		return inRange ? close + 1 : quote + 1;
	}
	const codePoint = content.codePointAt(quote + 1) ?? 0;
	const close = quote + 1 + (codePoint > 0xffff ? 2 : 1);
	return content[close] === "'" ? close + 1 : quote + 1;
}

function skipPrefixed(content: string, index: number): number {
	let end = index;
	while (end < content.length && IDENTIFIER_CHAR.test(content[end])) end++;
	const word = content.slice(index, end);
	const next = content[end];
	if (RAW_PREFIX.test(word)) return skipRaw(content, end) ?? end;
	if (QUOTED_PREFIX.test(word) && next === '"') return skipQuoted(content, end);
	if (word === "b" && next === "'") return skipCharOrLifetime(content, end);
	return end;
}

export function skipRustLiteral(
	content: string,
	index: number,
): number | undefined {
	const char = content[index];
	if (char === '"') return skipQuoted(content, index);
	if (char === "'") return skipCharOrLifetime(content, index);
	if (IDENTIFIER_CHAR.test(char)) return skipPrefixed(content, index);
	return undefined;
}
