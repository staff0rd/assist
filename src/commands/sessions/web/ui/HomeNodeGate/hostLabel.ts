export function hostLabel(url: string): string {
	try {
		return new URL(url).host;
	} catch {
		return url;
	}
}
