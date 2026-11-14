import { useTheme } from "@mui/material/styles";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Location } from "react-router";
import { animatePushPop } from "./animatePushPop";
import { captureFrames } from "./captureFrames";
import type { NavStackState } from "./nextNavStack";
import { prefersReducedMotion } from "./prefersReducedMotion";

function stop(animations: Animation[]) {
	for (const a of animations) a.cancel();
}

export function usePushPopAnimation(
	transition: NavStackState["transition"],
	moving: Location | undefined,
	under: Location | undefined,
	settle: (id: number) => void,
) {
	const { motion } = useTheme().tokens;
	const pages = useRef(new Map<string, HTMLElement>());
	const dim = useRef<HTMLDivElement>(null);
	const running = useRef<Animation[]>([]);
	useLayoutEffect(() => {
		const interruptedFrames = captureFrames(running.current);
		stop(running.current);
		running.current = [];
		if (!transition || !moving) return;
		const animations = animatePushPop(
			transition.kind,
			{
				moving: pages.current.get(moving.key),
				under: under && pages.current.get(under.key),
				dim: dim.current,
			},
			motion,
			{ reduced: prefersReducedMotion(), from: interruptedFrames },
		);
		if (!animations) {
			settle(transition.id);
			return;
		}
		running.current = animations;
		Promise.all(animations.map((a) => a.finished)).then(
			() => settle(transition.id),
			() => undefined,
		);
	}, [transition, moving, under, motion, settle]);
	useEffect(() => () => stop(running.current), []);
	const register = (key: string) => (el: HTMLElement | null) => {
		if (el) pages.current.set(key, el);
		else pages.current.delete(key);
	};
	return { register, dim, pages };
}
