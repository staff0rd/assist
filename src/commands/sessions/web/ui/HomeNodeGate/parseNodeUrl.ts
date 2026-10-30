const HAS_SCHEME = /^[a-z]+:[/]{2}/i;

export function parseNodeUrl(input: string): string | undefined {
	const trimmed = input.trim();
	const withScheme = HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
	try {
		const url = new URL(withScheme);
		if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
		return url.origin;
	} catch {
		return undefined;
	}
}
