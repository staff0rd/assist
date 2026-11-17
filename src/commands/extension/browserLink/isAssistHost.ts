export function isAssistHost(url: string | undefined): boolean {
	if (!url) return false;
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return false;
	}
	const { protocol, hostname } = parsed;
	if (protocol === "http:") return true;
	if (protocol !== "https:") return false;
	return (
		hostname === "github.com" ||
		hostname === "dev.azure.com" ||
		hostname.endsWith(".visualstudio.com")
	);
}
