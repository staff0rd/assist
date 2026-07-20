export function originToSshUrl(origin: string): string | null {
	if (origin.startsWith("local:")) return null;

	const firstSlash = origin.indexOf("/");
	if (firstSlash <= 0) return null;

	const host = origin.slice(0, firstSlash);
	const path = origin.slice(firstSlash + 1);
	if (!path) return null;

	return `git@${host}:${path}.git`;
}
