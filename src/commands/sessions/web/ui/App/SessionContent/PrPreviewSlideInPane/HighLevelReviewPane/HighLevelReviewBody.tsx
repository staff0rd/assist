import type { ComponentProps } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelSliceReview } from "../HighLevelSliceReview";
import type { HighLevelSliceModel } from "../HighLevelSliceReview/highLevelSliceModel";
import type { useHighLevelReviewNav } from "../HighLevelSliceReview/useHighLevelReviewNav";
import { HighLevelChecklistBody } from "./HighLevelReviewBody/HighLevelChecklistBody";
import { HighLevelHeadSourceProvider } from "./HighLevelReviewBody/HighLevelHeadSourceProvider";

export function HighLevelReviewBody({
	payload,
	sliced,
	nav,
	comments,
	...body
}: Omit<ComponentProps<typeof HighLevelChecklistBody>, "checks"> & {
	payload: HighLevelPreviewPayload;
	sliced?: HighLevelSliceModel | undefined;
	nav?: ReturnType<typeof useHighLevelReviewNav> | undefined;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<HighLevelHeadSourceProvider repo={payload.repo} headSha={payload.headSha}>
			{sliced && nav ? (
				<HighLevelSliceReview
					payload={payload}
					entries={sliced.entries}
					nav={nav}
					checklist={body.checklist}
					comments={comments}
				/>
			) : (
				<HighLevelChecklistBody checks={payload.checks} {...body} />
			)}
		</HighLevelHeadSourceProvider>
	);
}
