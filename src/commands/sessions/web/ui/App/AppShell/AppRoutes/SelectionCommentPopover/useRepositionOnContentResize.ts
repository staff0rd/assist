import type { PopoverActions } from "@mui/material";
import { type RefObject, useEffect, useState } from "react";

export function useRepositionOnContentResize(
	actions: RefObject<PopoverActions | null>,
	open: boolean,
): (element: HTMLElement | null) => void {
	const [content, setContent] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!open || !content || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() =>
			actions.current?.updatePosition(),
		);
		observer.observe(content);
		return () => observer.disconnect();
	}, [actions, content, open]);

	return setContent;
}
