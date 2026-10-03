export function parseLinkUrl(url: string): string {
	const parsed = new URL(url);
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
		throw new Error(`link url must be http(s): ${url}`);
	return parsed.origin;
}
