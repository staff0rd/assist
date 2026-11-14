const STALE_MS = 100;

export function swipeVelocity() {
	let last = { x: 0, t: 0 };
	let v = 0;
	return {
		reset(x: number, t: number) {
			last = { x, t };
			v = 0;
		},
		sample(x: number, t: number) {
			const dt = t - last.t;
			if (dt <= 0) return;
			v = 0.7 * ((x - last.x) / dt) + 0.3 * v;
			last = { x, t };
		},
		at(t: number) {
			return t - last.t > STALE_MS ? 0 : v;
		},
	};
}
