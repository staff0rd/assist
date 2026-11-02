import { useCallback, useMemo, useSyncExternalStore } from "react";
import { groupCollapseStore } from "./useCollapsedGroups/groupCollapseStore";

type CollapsedGroups = {
	isCollapsed: (key: string) => boolean;
	setCollapsed: (key: string, collapsed: boolean) => void;
};

export function useCollapsedGroups(): CollapsedGroups {
	const raw = useSyncExternalStore(
		groupCollapseStore.subscribe,
		groupCollapseStore.getRaw,
	);
	const choices = useMemo(() => groupCollapseStore.parse(raw), [raw]);
	const isCollapsed = useCallback(
		(key: string) => {
			const choice = choices[key];
			return choice !== undefined && "collapsedAt" in choice;
		},
		[choices],
	);
	return useMemo(
		() => ({
			isCollapsed,
			setCollapsed: (key: string, collapsed: boolean) =>
				groupCollapseStore.setChoice(
					key,
					collapsed ? { collapsedAt: Date.now() } : { openedAt: Date.now() },
				),
		}),
		[isCollapsed],
	);
}
