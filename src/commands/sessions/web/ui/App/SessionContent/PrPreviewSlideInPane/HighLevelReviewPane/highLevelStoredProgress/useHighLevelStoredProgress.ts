import { useMemo, useState } from "react";
import type { PrPreview } from "../../../../../../../shared/SessionInfoBase";
import type { HighLevelPaneProgress } from "../../../../../../../../review/highLevel/progressStore/StoredHighLevelProgress";
import { parseHighLevelPreview } from "../useHighLevelReviewPane/parseHighLevelPreview";
import { useHighLevelProgressWrites } from "./useHighLevelProgressWrites";
import { useLoadHighLevelStoredProgress } from "./useLoadHighLevelStoredProgress";

export type HighLevelStoredProgress = {
	progress: HighLevelPaneProgress | undefined;
	version: number;
	onChange: (progress: HighLevelPaneProgress) => void;
	close: () => void;
};

export function useHighLevelStoredProgress(
	preview: PrPreview,
	node: string | undefined,
): HighLevelStoredProgress {
	const payload = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const head = {
		repo: payload.repo,
		prNumber: payload.prNumber,
		headSha: payload.headSha,
	};
	const [state, setState] = useState(() => ({
		progress: payload.progress ?? payload.saved,
		version: 0,
	}));
	const writes = useHighLevelProgressWrites(
		{ ...head, requestId: preview.requestId },
		node,
	);

	useLoadHighLevelStoredProgress(head, node, (fetched) => {
		const editedFirst = writes.markLoaded();
		if (editedFirst || !fetched) return;
		if (fetched.updatedAt === payload.progress?.updatedAt) return;
		setState((current) => ({
			progress: fetched,
			version: current.version + 1,
		}));
	});

	return { ...state, onChange: writes.onChange, close: writes.close };
}
