import { useMemo } from "react";
import type { PrPreview } from "../../../../../../../shared/SessionInfoBase";
import { highLevelSliceModel } from "../../HighLevelSliceReview/highLevelSliceModel";
import { parseHighLevelPreview } from "./parseHighLevelPreview";

export function useHighLevelPanePayload(preview: PrPreview) {
	const payload = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const sliced = useMemo(() => highLevelSliceModel(payload), [payload]);
	return { payload, sliced };
}
