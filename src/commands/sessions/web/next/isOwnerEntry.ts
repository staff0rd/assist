export function isOwnerEntry(entry: string): boolean {
	return !entry.includes("/");
}
