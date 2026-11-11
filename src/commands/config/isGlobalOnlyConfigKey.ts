const GLOBAL_ONLY_KEYS = ["sync.autoConfirm", "inbox.intervalMinutes"];
const GLOBAL_ONLY_ROOTS = ["database"];

export function isGlobalOnlyConfigKey(key: string): boolean {
	return (
		GLOBAL_ONLY_KEYS.some((k) => key.startsWith(k)) ||
		GLOBAL_ONLY_ROOTS.includes(key.split(".")[0])
	);
}
