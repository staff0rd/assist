let release: (() => void) | undefined;

export function onReleaseWebServerPort(fn: () => void): void {
	release = fn;
}

export function releaseWebServerPort(): void {
	const fn = release;
	release = undefined;
	fn?.();
}
