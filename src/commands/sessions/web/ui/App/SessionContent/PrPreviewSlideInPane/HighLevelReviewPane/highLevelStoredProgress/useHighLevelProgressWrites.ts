import { useMemo, useRef } from "react";
import type {
	HighLevelPaneProgress,
	HighLevelProgressHead,
} from "../../../../../../../../review/highLevel/progressStore/StoredHighLevelProgress";
import { createHighLevelProgressWriter } from "./createHighLevelProgressWriter";

export function useHighLevelProgressWrites(
	head: HighLevelProgressHead,
	node: string | undefined,
) {
	const { repo, prNumber, headSha, requestId } = head;
	const writer = useMemo(
		() =>
			repo && headSha
				? createHighLevelProgressWriter(
						{ repo, prNumber, headSha, requestId },
						node,
					)
				: undefined,
		[repo, prNumber, headSha, requestId, node],
	);
	const loaded = useRef(false);
	const pending = useRef<HighLevelPaneProgress | undefined>(undefined);

	return {
		markLoaded: (): boolean => {
			loaded.current = true;
			if (pending.current) writer?.write(pending.current);
			return pending.current !== undefined;
		},
		onChange: (progress: HighLevelPaneProgress) => {
			pending.current = progress;
			if (loaded.current) writer?.write(progress);
		},
		close: () => writer?.close(),
	};
}
