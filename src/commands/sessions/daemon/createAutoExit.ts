const DEFAULT_GRACE_MS = 60_000;

export function createAutoExit(
	exit: () => void,
	graceMs = DEFAULT_GRACE_MS,
): (idle: boolean) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return (idle) => {
		if (!idle) {
			if (timer) clearTimeout(timer);
			timer = null;
			return;
		}
		timer ??= setTimeout(exit, graceMs);
	};
}
