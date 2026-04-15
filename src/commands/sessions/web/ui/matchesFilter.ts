export function matchesFilter(name: string, filter: string): boolean {
	if (!filter) return true;
	const pattern = filter.includes("*") ? filter : `*${filter}*`;
	const escaped = pattern
		.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
		.replace(/\*/g, ".*");
	return new RegExp(`^${escaped}$`, "i").test(name);
}
