import { useEffect, useRef } from "react";
import type {
	HighLevelPaneProgress,
	HighLevelProgressHead,
} from "../../../../../../../../review/highLevel/progressStore/StoredHighLevelProgress";
import { fetchHighLevelProgress } from "./fetchHighLevelProgress";

export function useLoadHighLevelStoredProgress(
	head: HighLevelProgressHead,
	node: string | undefined,
	onLoaded: (fetched: HighLevelPaneProgress | undefined) => void,
): void {
	const latest = useRef(onLoaded);
	latest.current = onLoaded;
	const { repo, prNumber, headSha } = head;

	useEffect(() => {
		if (!repo || !headSha) return;
		let cancelled = false;
		const settle = (fetched: HighLevelPaneProgress | undefined) => {
			if (!cancelled) latest.current(fetched);
		};
		fetchHighLevelProgress({ repo, prNumber, headSha }, node).then(settle, () =>
			settle(undefined),
		);
		return () => {
			cancelled = true;
		};
	}, [repo, prNumber, headSha, node]);
}
