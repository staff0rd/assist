/**
 * URL filter baked into the extension. An empty pattern matches everything; a
 * non-empty pattern is a case-sensitive substring match against the URL. The
 * extension's background.js mirrors this logic so only matching requests
 * forward to the receiver.
 */
export function matchesNetcapFilter(url: string, pattern: string): boolean {
	if (!pattern) return true;
	return url.includes(pattern);
}
