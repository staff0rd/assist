import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { CommentSentSnackbar } from "../../CommentSentSnackbar";
import { HighLevelChecklistBody } from "./HighLevelReviewPane/HighLevelChecklistBody";
import { HighLevelReviewActions } from "./HighLevelReviewPane/HighLevelReviewActions";
import { highLevelDecisionDetails } from "./HighLevelReviewPane/highLevelDecisionDetails";
import type { PrDecisionDetails } from "../../../PrDecisionDetails";
import { PreviewMetadataList } from "./PreviewMetadataList";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import type { SessionInfo } from "../../../types";
import { useHighLevelReviewPane } from "./HighLevelReviewPane/useHighLevelReviewPane";

export function HighLevelReviewPane({
	preview,
	session,
	sendInput,
	onDecision,
}: {
	preview: PrPreview;
	session?: SessionInfo | undefined;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const { payload, checklist, details, sentTo, clearSent } =
		useHighLevelReviewPane(preview, session, sendInput);

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
			<CommentSentSnackbar sessionName={sentTo} onClose={clearSent} />
		</Box>
	);
}
