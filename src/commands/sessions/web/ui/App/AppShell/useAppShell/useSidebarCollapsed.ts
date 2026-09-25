import { useCallback, useMemo, useState } from "react";
import { loadPersisted, savePersisted } from "../../loadPersisted";
import type { SidebarCollapse } from "../../useSidebarCollapsedContext";

const KEY = "assist:sidebar-collapsed";

export function useSidebarCollapsed(): SidebarCollapse {
	const [collapsed, setCollapsed] = useState(
		() => loadPersisted<true>(KEY).length > 0,
	);

	const onToggleCollapsed = useCallback(() => {
		setCollapsed((current) => {
			const next = !current;
			savePersisted(KEY, next ? [true] : []);
			return next;
		});
	}, []);

	return useMemo(
		() => ({ collapsed, onToggleCollapsed }),
		[collapsed, onToggleCollapsed],
	);
}
