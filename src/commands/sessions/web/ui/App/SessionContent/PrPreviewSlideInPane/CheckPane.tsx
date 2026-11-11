import { Box, Divider } from "@mui/material";
import { useMemo } from "react";
import { CommentSentSnackbar } from "../../CommentSentSnackbar";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { CheckActions } from "./CheckPane/CheckActions";
import { CheckBody } from "./CheckPane/CheckBody";
import { CheckCommentLayer } from "./CheckPane/CheckCommentLayer";
import { checkDecisionHandlers } from "./CheckPane/checkDecisionHandlers";
import { parseCheckPreview } from "./CheckPane/parseCheckPreview";
import { useHighLevelDiffComments } from "./HighLevelReviewPane/useHighLevelReviewPane/useHighLevelDiffComments";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";

export function CheckPane({
	preview,
	session,
	sendInput,
	onDecision,
}: Pick<
	PrPreviewPaneProps,
	"preview" | "session" | "sendInput" | "onDecision"
>) {
	const check = useMemo(() => parseCheckPreview(preview.body), [preview.body]);
	const { comments, sentTo, clearSent } = useHighLevelDiffComments(
		session,
		sendInput,
	);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
				<CheckCommentLayer check={check} comments={comments}>
					<CheckBody check={check} />
				</CheckCommentLayer>
			</Box>
			<Divider />
			<CheckActions
				laterPhases={check.laterPhases}
				{...checkDecisionHandlers(onDecision)}
			/>
			<CommentSentSnackbar
				sessionName={sentTo}
				subject="Question"
				onClose={clearSent}
			/>
		</Box>
	);
}
