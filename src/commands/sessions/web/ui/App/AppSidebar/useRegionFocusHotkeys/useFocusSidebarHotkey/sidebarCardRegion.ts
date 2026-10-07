import type { Region } from "../../../focusRegion";
import { sessionRegion } from "../sessionRegion";

const firstCardRegion: Region = {
	locate: () =>
		globalThis.document.querySelector<HTMLElement>("[data-session-id]"),
	focus: (card) => {
		const id = card.dataset.sessionId;
		if (id) sessionRegion("card", id).focus(card);
	},
};

export function sidebarCardRegion(id: string | null): Region {
	return id ? sessionRegion("card", id) : firstCardRegion;
}
