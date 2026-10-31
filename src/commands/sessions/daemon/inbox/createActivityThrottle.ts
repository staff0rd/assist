const ACTIVITY_THROTTLE_MS = 1000;

export function createActivityThrottle(onActivity: () => void) {
	let pending: ReturnType<typeof setTimeout> | undefined;
	return {
		schedule() {
			pending ??= setTimeout(() => {
				pending = undefined;
				onActivity();
			}, ACTIVITY_THROTTLE_MS);
		},
		cancel() {
			clearTimeout(pending);
			pending = undefined;
		},
	};
}
