import { Box, Divider } from "@mui/material";
import { useMemo } from "react";
import type { PrPreview } from "../../../../../../../../../../../shared/SessionInfoBase";
import { highLevelCheckDetails } from "./HighLevelReviewPane/highLevelCheckDetails";
import { HighLevelChecklistBody } from "./HighLevelReviewPane/HighLevelChecklistBody";
import { HighLevelReviewActions } from "./HighLevelReviewPane/HighLevelReviewActions";
import { highLevelDecisionDetails } from "./HighLevelReviewPane/highLevelDecisionDetails";
import { parseHighLevelPreview } from "./HighLevelReviewPane/parseHighLevelPreview";
import type { PrDecisionDetails } from "../../../../../../../../../PrDecisionDetails";
import { PreviewMetadataList } from "./PreviewMetadataList";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { useHighLevelChecklist } from "./HighLevelReviewPane/useHighLevelChecklist";

export function HighLevelReviewPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const payload = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const checklist = useHighLevelChecklist(payload.checks, payload.saved);
	const details = useMemo(() => highLevelCheckDetails(payload), [payload]);

	const decide = (decision: "approve" | "reject") =>
		onDecision(decision, highLevelDecisionDetails(checklist.checklist()));

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<HighLevelChecklistBody
				checks={payload.checks}
				checklist={checklist}
				details={details}
			/>
			<Divider />
			<HighLevelReviewActions
				failed={
					payload.checks.filter((check) => check.status === "fail").length
				}
				outstanding={checklist.outstanding}
				onApprove={() => decide("approve")}
				onRequestChanges={() => decide("reject")}
			/>
		</Box>
	);
}
