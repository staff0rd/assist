import type { ActiveTokens } from "../../designSystem/DesignTokens";
import type { CurrentFrames } from "./captureFrames";

type Layers = {
	moving?: HTMLElement;
	under?: HTMLElement;
	dim?: HTMLElement | null;
};

type Options = { reduced: boolean; from: CurrentFrames };

function startingAt(first: Keyframe, captured: Keyframe | undefined) {
	if (!captured) return first;
	const start: Keyframe = {};
	for (const key of Object.keys(first))
		start[key] = captured[key] ?? first[key];
	return start;
}

export function animatePushPop(
	kind: "push" | "pop",
	{ moving, under, dim }: Layers,
	motion: ActiveTokens["motion"],
	{ reduced, from }: Options,
): Animation[] | null {
	if (typeof moving?.animate !== "function") return null;
	const { duration, easing } = reduced ? motion.crossfade : motion.push;
	const options = { duration, easing, fill: "both" } as const;
	const run = (el: HTMLElement, start: Keyframe, end: Keyframe) => {
		const [first, last] = kind === "push" ? [start, end] : [end, start];
		return el.animate([startingAt(first, from.get(el)), last], options);
	};
	if (reduced) return [run(moving, { opacity: 0 }, { opacity: 1 })];
	return [
		run(
			moving,
			{ transform: "translateX(100%)" },
			{ transform: "translateX(0)" },
		),
		under &&
			run(
				under,
				{ transform: "translateX(0)" },
				{ transform: `translateX(${-motion.push.parallax * 100}%)` },
			),
		dim && run(dim, { opacity: 0 }, { opacity: 1 }),
	].filter((a): a is Animation => Boolean(a));
}
