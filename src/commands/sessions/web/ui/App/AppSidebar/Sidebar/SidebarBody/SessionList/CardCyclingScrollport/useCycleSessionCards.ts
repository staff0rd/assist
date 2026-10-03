import { type KeyboardEvent, useCallback } from "react";
import { adjacentSessionId } from "./useCycleSessionCards/adjacentSessionId";
import { holdSessionCardFocus } from "../../../../../holdSessionCardFocus";
import { scrollSessionCardIntoView } from "../../../../scrollSessionCardIntoView";
import type { SessionInfo } from "../../../../../../types";
import { useStarredSessions } from "../../../../../useStarredSessions";
import { visibleSessionOrder } from "../../../../visibleSessionOrder";

export function useCycleSessionCards({
	sessions,
	onSelect,
	isFloatingWaiter,
}: {
	sessions: SessionInfo[];
	onSelect: (id: string) => void;
	isFloatingWaiter?: (session: SessionInfo) => boolean;
}): (event: KeyboardEvent) => void {
	const { isStarred } = useStarredSessions();
	return useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== "Tab" || event.ctrlKey || event.altKey || event.metaKey)
				return;
			const card = (event.target as Element).closest("[data-session-id]");
			if (!card) return;
			const order = visibleSessionOrder(
				sessions,
				isStarred,
				isFloatingWaiter,
			).map((s) => s.id);
			const id = adjacentSessionId(
				order,
				card.getAttribute("data-session-id"),
				event.shiftKey ? -1 : 1,
			);
			if (!id) return;
			event.preventDefault();
			onSelect(id);
			holdSessionCardFocus(id);
			scrollSessionCardIntoView(id);
		},
		[sessions, isStarred, isFloatingWaiter, onSelect],
	);
}
