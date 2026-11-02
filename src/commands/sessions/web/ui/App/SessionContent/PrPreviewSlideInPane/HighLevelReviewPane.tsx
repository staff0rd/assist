import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { CommentSentSnackbar } from "../../CommentSentSnackbar";
import { HighLevelReviewBody } from "./HighLevelReviewPane/HighLevelReviewBody";
import { HighLevelReviewActions } from "./HighLevelReviewPane/HighLevelReviewActions";
import { HighLevelReviewQueue } from "./HighLevelReviewPane/HighLevelReviewQueue";
import { highLevelReviewHandlers } from "./HighLevelReviewPane/highLevelReviewHandlers";
import type { PrDecisionDetails } from "../../../PrDecisionDetails";
import { PreviewMetadataList } from "./PreviewMetadataList";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import type { SessionInfo } from "../../../types";
import { useHighLevelReviewPane } from "./HighLevelReviewPane/useHighLevelReviewPane";
import { clearPersistedHighLevelProgress } from "./HighLevelReviewPane/useHighLevelReviewPane/loadPersistedHighLevelProgress";

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
	const { payload, checklist, queue, details, counts, sentTo, clearSent } =
		useHighLevelReviewPane(preview, session, sendInput);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<HighLevelReviewBody
				payload={payload}
				checklist={checklist}
				details={details}
				counts={counts}
			/>
			<Divider />
			<HighLevelReviewQueue queued={queue.queued} onRemove={queue.onRemove} />
			<HighLevelReviewActions
				failed={
					payload.checks.filter((check) => check.status === "fail").length
				}
				outstanding={checklist.outstanding}
				{...highLevelReviewHandlers(
					checklist.checklist,
					queue.queued,
					(decision, decisionDetails) => {
						clearPersistedHighLevelProgress(preview.requestId);
						onDecision(decision, decisionDetails);
					},
				)}
			/>
			<CommentSentSnackbar sessionName={sentTo} onClose={clearSent} />
		</Box>
	);
}
