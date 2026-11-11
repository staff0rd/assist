const NODE_ONLY_KEYS = ["inbox.intervalMinutes"];
const NODE_ONLY_ROOTS = ["database", "repos"];

export function isNodeOnlyConfigKey(key: string): boolean {
	return (
		NODE_ONLY_KEYS.some((k) => key.startsWith(k)) ||
		NODE_ONLY_ROOTS.includes(key.split(".")[0])
	);
}
