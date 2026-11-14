import type { ActiveTokens } from "../../designSystem/DesignTokens";
import { applySwipeFrame, type SwipeLayers, swipeFrame } from "./swipeFrame";

const MIN_MS = 120;

export async function animateSwipeTo(
	layers: SwipeLayers,
	from: number,
	to: number,
	{ duration, easing, parallax }: ActiveTokens["motion"]["push"],
): Promise<void> {
	if (typeof layers.moving.animate === "function") {
		const a = swipeFrame(from, parallax);
		const b = swipeFrame(to, parallax);
		const options = {
			duration: Math.max(MIN_MS, duration * Math.abs(to - from)),
			easing,
		};
		const animations = (["moving", "under", "dim"] as const).flatMap((k) => {
			const el = layers[k];
			return el ? [el.animate([a[k], b[k]], options)] : [];
		});
		applySwipeFrame(layers, to, parallax);
		await Promise.allSettled(animations.map((x) => x.finished));
	}
	applySwipeFrame(layers, to, parallax);
}
