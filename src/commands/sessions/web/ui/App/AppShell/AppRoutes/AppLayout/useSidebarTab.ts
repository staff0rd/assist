import { useCallback, useState } from "react";
import type { SidebarTab } from "../../../../types";

export function useSidebarTab(
	requestHistory: () => void,
	clearTranscript: () => void,
): { tab: SidebarTab; onTabChange: (next: SidebarTab) => void } {
	const [tab, setTab] = useState<SidebarTab>("active");

	const onTabChange = useCallback(
		(next: SidebarTab) => {
			if (next === "history") requestHistory();
			else clearTranscript();
			setTab(next);
		},
		[requestHistory, clearTranscript],
	);

	return { tab, onTabChange };
}
