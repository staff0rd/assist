import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { CommentSentSnackbar } from "../../CommentSentSnackbar";
import { HighLevelReviewBody } from "./HighLevelReviewPane/HighLevelReviewBody";
import { HighLevelReviewFooter } from "./HighLevelReviewPane/HighLevelReviewFooter";
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
	const pane = useHighLevelReviewPane(preview, session, sendInput);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<HighLevelReviewBody
				payload={pane.payload}
				checklist={pane.checklist}
				details={pane.details}
				counts={pane.counts}
				sliced={pane.sliced}
				nav={pane.nav}
				comments={pane.diffComments}
			/>
			<Divider />
			<HighLevelReviewFooter
				pane={pane}
				onDecision={(decision, details) => {
					clearPersistedHighLevelProgress(preview.requestId);
					onDecision(decision, details);
				}}
			/>
			<CommentSentSnackbar sessionName={pane.sentTo} onClose={pane.clearSent} />
		</Box>
	);
}
