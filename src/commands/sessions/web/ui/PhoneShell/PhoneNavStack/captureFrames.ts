export type CurrentFrames = Map<Element, Keyframe>;

export function captureFrames(animations: Animation[]): CurrentFrames {
	const frames: CurrentFrames = new Map();
	for (const animation of animations) {
		const target = (animation.effect as KeyframeEffect | null)?.target;
		if (!target || frames.has(target)) continue;
		const { transform, opacity } = getComputedStyle(target);
		frames.set(target, { transform, opacity });
	}
	return frames;
}
