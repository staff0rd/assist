import type { ActiveTokens } from "../../designSystem/DesignTokens";

type Layers = {
	moving?: HTMLElement;
	under?: HTMLElement;
	dim?: HTMLElement | null;
};

export function animatePushPop(
	kind: "push" | "pop",
	{ moving, under, dim }: Layers,
	{ duration, easing, parallax }: ActiveTokens["motion"]["push"],
): Animation[] | null {
	if (typeof moving?.animate !== "function") return null;
	const options = { duration, easing, fill: "forwards" } as const;
	const run = (el: HTMLElement, start: Keyframe, end: Keyframe) =>
		el.animate(kind === "push" ? [start, end] : [end, start], options);
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
				{ transform: `translateX(${-parallax * 100}%)` },
			),
		dim && run(dim, { opacity: 0 }, { opacity: 1 }),
	].filter((a): a is Animation => Boolean(a));
}
