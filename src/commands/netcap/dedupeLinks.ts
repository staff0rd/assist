function decodeSafetyLink(url: string): string {
	try {
		const wrapped = new URL(url).searchParams.get("url");
		return wrapped ? decodeURIComponent(wrapped) : url;
	} catch {
		return url;
	}
}

/** Dedupe outbound links, decoding LinkedIn's `safety/go` redirect wrapper. */
export function dedupeLinks(links: string[]): string[] {
	return [
		...new Set(
			links.map((l) => (/\/safety\/go\//.test(l) ? decodeSafetyLink(l) : l)),
		),
	];
}
