import { useEffect, useState } from "react";
import type { DocsRefreshView } from "../getDocsRefresh";
import { fetchDocsRefreshState } from "./api";

export function useDocsRefreshState(
	cwd: string | undefined,
	node: string | undefined,
	revision: unknown,
): DocsRefreshView | undefined {
	const [state, setState] = useState<DocsRefreshView>();

	useEffect(() => {
		const controller = new AbortController();
		fetchDocsRefreshState(cwd, node, controller.signal)
			.then(setState)
			.catch(() => {});
		return () => controller.abort();
	}, [cwd, node, revision]);

	return state;
}
