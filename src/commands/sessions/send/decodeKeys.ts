const NAMED: Record<string, string> = {
	r: "\r",
	n: "\n",
	t: "\t",
	e: "\x1b",
	"\\": "\\",
};

export function decodeKeys(keys: string): string {
	return keys.replace(/\\(x[0-9a-fA-F]{2}|[rnte\\])/g, (_, code: string) =>
		code.startsWith("x")
			? String.fromCharCode(Number.parseInt(code.slice(1), 16))
			: NAMED[code],
	);
}
