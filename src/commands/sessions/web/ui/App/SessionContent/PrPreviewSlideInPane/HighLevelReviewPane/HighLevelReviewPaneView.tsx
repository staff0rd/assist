import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import { CommentSentSnackbar } from "../../../CommentSentSnackbar";
import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import type { SessionInfo } from "../../../../types";
import { PrPreviewHeader } from "../../PrPreviewHeader";
import { prPreviewPaneSx } from "../../prPreviewPaneSx";
import { PreviewMetadataList } from "../PreviewMetadataList";
import type { HighLevelStoredProgress } from "./highLevelStoredProgress/useHighLevelStoredProgress";
import { HighLevelReviewBody } from "./HighLevelReviewBody";
import { HighLevelReviewFooter } from "./HighLevelReviewFooter";
import { useHighLevelReviewPane } from "./useHighLevelReviewPane";

export function HighLevelReviewPaneView({
	preview,
	session,
	sendInput,
	stored,
	onDecision,
}: {
	preview: PrPreview;
	session: SessionInfo | undefined;
	sendInput: ((sessionId: string, data: string) => void) | undefined;
	stored: HighLevelStoredProgress;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const pane = useHighLevelReviewPane(preview, session, sendInput, stored);

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
					stored.close();
					onDecision(decision, details);
				}}
			/>
			<CommentSentSnackbar sessionName={pane.sentTo} onClose={pane.clearSent} />
		</Box>
	);
}
