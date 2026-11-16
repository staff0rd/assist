export function commentUrl(raw: string): string | undefined {
	try {
		const parsed = JSON.parse(raw) as { html_url?: string };
		return parsed.html_url;
	} catch {
		return undefined;
	}
}
