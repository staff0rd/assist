export function ghsaFromUrl(url: string | undefined): string | undefined {
	return url?.match(/GHSA-[\w-]+/)?.[0];
}
