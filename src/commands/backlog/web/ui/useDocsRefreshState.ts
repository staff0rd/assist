import { useEffect, useState } from "react";
import type { DocsRefreshState } from "../../loadDocsRefreshState";
import { fetchDocsRefreshState } from "./api";

export function useDocsRefreshState(
	cwd: string | undefined,
	node: string | undefined,
	revision: unknown,
): DocsRefreshState | undefined {
	const [state, setState] = useState<DocsRefreshState>();

	useEffect(() => {
		const controller = new AbortController();
		fetchDocsRefreshState(cwd, node, controller.signal)
			.then(setState)
			.catch(() => {});
		return () => controller.abort();
	}, [cwd, node, revision]);

	return state;
}
