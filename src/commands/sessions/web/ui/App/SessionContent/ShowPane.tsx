import { Box, Button, Divider, Stack } from "@mui/material";
import { useMemo } from "react";
import { MarkdownSegments } from "../../../../../backlog/web/ui/components/MarkdownSegments";
import { splitMarkdownSegments } from "../../../../../backlog/web/ui/components/splitMarkdownSegments";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../types";
import { CommentSentSnackbar } from "../CommentSentSnackbar";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { useHighLevelDiffComments } from "./PrPreviewSlideInPane/HighLevelReviewPane/useHighLevelReviewPane/useHighLevelDiffComments";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { addCopyButtons } from "./ShowPane/addCopyButtons";
import { copyCodeOnClick } from "./ShowPane/copyCodeOnClick";
import { ShowCommentLayer } from "./ShowPane/ShowCommentLayer";
import { showBodySx } from "./ShowPane/showBodySx";

export function ShowPane({
	preview,
	session,
	sendInput,
	onClose,
}: {
	preview: PrPreview;
	session?: SessionInfo | undefined;
	sendInput?: ((sessionId: string, data: string) => void) | undefined;
	onClose: () => void;
}) {
	const { comments, sentTo, clearSent } = useHighLevelDiffComments(
		session,
		sendInput,
	);
	const segments = useMemo(
		() =>
			splitMarkdownSegments(preview.body).map((segment) =>
				segment.type === "html"
					? { ...segment, html: addCopyButtons(segment.html) }
					: segment,
			),
		[preview.body],
	);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<Box sx={showBodySx} onClick={copyCodeOnClick}>
				<ShowCommentLayer preview={preview} comments={comments}>
					<MarkdownSegments segments={segments} />
				</ShowCommentLayer>
			</Box>
			<Divider />
			<Stack direction="row" sx={{ p: 2, justifyContent: "flex-end" }}>
				<Button variant="outlined" onClick={onClose}>
					Close
				</Button>
			</Stack>
			<CommentSentSnackbar
				sessionName={sentTo}
				subject="Question"
				onClose={clearSent}
			/>
		</Box>
	);
}
