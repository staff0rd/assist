export function isMacPlatform(): boolean {
	return /Mac|iPhone|iPad/.test(globalThis.navigator?.platform ?? "");
}
