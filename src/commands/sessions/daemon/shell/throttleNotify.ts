const INTERVAL_MS = 150;

export function throttleNotify(notify: () => void) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const fire = () => {
		timer = undefined;
		notify();
	};
	const update = () => {
		timer ??= setTimeout(fire, INTERVAL_MS);
	};
	update.cancel = () => {
		if (timer) clearTimeout(timer);
		timer = undefined;
	};
	return update;
}
