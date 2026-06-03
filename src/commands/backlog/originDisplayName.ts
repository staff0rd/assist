/**
 * Derive a short, human-readable repository name from a normalized origin key.
 *
 * - `github.com/org/repo` → `org/repo` (the host segment is dropped)
 * - `local:/path/to/repo` → `repo` (the final path segment, for remote-less repos)
 */
export function originDisplayName(origin: string): string {
	if (origin.startsWith("local:")) {
		const path = origin.slice("local:".length).replace(/\/+$/, "");
		const segments = path.split("/").filter(Boolean);
		return segments[segments.length - 1] ?? origin;
	}

	const firstSlash = origin.indexOf("/");
	if (firstSlash === -1) return origin;
	return origin.slice(firstSlash + 1);
}
