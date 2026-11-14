import { useTheme } from "@mui/material/styles";
import { useLayoutEffect, useRef } from "react";
import type { Location } from "react-router";
import { animatePushPop } from "./animatePushPop";
import type { NavStackState } from "./nextNavStack";

export function usePushPopAnimation(
	transition: NavStackState["transition"],
	moving: Location | undefined,
	under: Location | undefined,
	settle: (id: number) => void,
) {
	const motion = useTheme().tokens.motion.push;
	const pages = useRef(new Map<string, HTMLElement>());
	const dim = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!transition || !moving) return;
		const animations = animatePushPop(
			transition.kind,
			{
				moving: pages.current.get(moving.key),
				under: under && pages.current.get(under.key),
				dim: dim.current,
			},
			motion,
		);
		if (!animations) {
			settle(transition.id);
			return;
		}
		let live = true;
		Promise.all(animations.map((a) => a.finished)).then(
			() => live && settle(transition.id),
			() => undefined,
		);
		return () => {
			live = false;
			for (const a of animations) a.cancel();
		};
	}, [transition, moving, under, motion, settle]);

	const register = (key: string) => (el: HTMLElement | null) => {
		if (el) pages.current.set(key, el);
		else pages.current.delete(key);
	};
	return { register, dim };
}
