export function withCwd(url: string, cwd?: string): string {
	if (!cwd) return url;
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}cwd=${encodeURIComponent(cwd)}`;
}
