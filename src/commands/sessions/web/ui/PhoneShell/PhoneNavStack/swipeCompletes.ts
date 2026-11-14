const FLICK_PX_PER_MS = 0.3;

export function swipeCompletes(progress: number, velocity: number): boolean {
	if (velocity > FLICK_PX_PER_MS) return true;
	if (velocity < -FLICK_PX_PER_MS) return false;
	return progress > 0.5;
}
