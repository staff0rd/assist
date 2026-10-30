const GLOBAL_ONLY_KEYS = ["sync.autoConfirm", "inbox.intervalMinutes"];

export function isGlobalOnlyConfigKey(key: string): boolean {
	return GLOBAL_ONLY_KEYS.some((k) => key.startsWith(k));
}
