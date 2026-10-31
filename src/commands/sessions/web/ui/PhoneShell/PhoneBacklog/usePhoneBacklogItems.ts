import { useEffect, useState } from "react";
import { backlogLoadHandlers } from "../../../../../backlog/web/ui/backlogLoadHandlers";
import { startBacklogPolling } from "../../../../../backlog/web/ui/startBacklogPolling";
import type { BacklogItemSummary } from "../../../../../backlog/web/ui/types";

export function usePhoneBacklogItems(cwd: string | undefined) {
	const [items, setItems] = useState<BacklogItemSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [loadedCwd, setLoadedCwd] = useState(cwd);

	if (cwd !== loadedCwd) {
		setLoadedCwd(cwd);
		setItems([]);
		setLoading(true);
		setError(null);
	}

	useEffect(() => {
		if (!cwd) return;
		return startBacklogPolling(
			cwd,
			"todo",
			backlogLoadHandlers({ setItems, setLoading, setError }),
		);
	}, [cwd]);

	return { items, loading, error };
}
