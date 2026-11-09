export function parseProtocol(
	raw: string | undefined,
): "http" | "https" | undefined {
	if (raw === undefined) return undefined;
	if (raw !== "http" && raw !== "https") {
		console.error(`--protocol must be http or https, got "${raw}"`);
		process.exit(1);
	}
	return raw;
}
