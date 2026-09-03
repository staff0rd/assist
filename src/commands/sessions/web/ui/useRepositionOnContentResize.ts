import type { PopoverActions } from "@mui/material";
import { type RefObject, useEffect } from "react";

export function useRepositionOnContentResize(
	actions: RefObject<PopoverActions | null>,
	content: RefObject<HTMLElement | null>,
	open: boolean,
): void {
	useEffect(() => {
		const element = content.current;
		if (!open || !element || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() =>
			actions.current?.updatePosition(),
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, [actions, content, open]);
}
