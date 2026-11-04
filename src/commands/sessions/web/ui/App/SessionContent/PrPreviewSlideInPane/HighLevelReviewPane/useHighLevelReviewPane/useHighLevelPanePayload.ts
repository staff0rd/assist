import { useMemo } from "react";
import type { PrPreview } from "../../../../../../../shared/SessionInfoBase";
import { highLevelSliceModel } from "../../HighLevelSliceReview/highLevelSliceModel";
import { loadPersistedHighLevelProgress } from "./loadPersistedHighLevelProgress";
import { parseHighLevelPreview } from "./parseHighLevelPreview";

export function useHighLevelPanePayload(preview: PrPreview) {
	const payload = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const sliced = useMemo(() => highLevelSliceModel(payload), [payload]);
	const progress = useMemo(
		() =>
			loadPersistedHighLevelProgress(preview.requestId, preview.supersedes) ??
			payload.draft ??
			payload.saved,
		[preview.requestId, preview.supersedes, payload],
	);
	return { payload, sliced, progress };
}
