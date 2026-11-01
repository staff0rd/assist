import { Box, Divider } from "@mui/material";
import { CommentSentSnackbar } from "../../CommentSentSnackbar";
import { PrPreviewContent } from "./PrPreviewPane/PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewPane/PrPreviewFooter";
import { PrPreviewHeader } from "../PrPreviewHeader";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";
import { PreviewLinks } from "./PreviewLinks";
import { previewFooterProps } from "./PrPreviewPane/previewFooterProps";
import { previewPaneOptions } from "./PrPreviewPane/previewPaneOptions";
import { previewRuleActions } from "./PrPreviewPane/previewRuleActions";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { usePrPane } from "./PrPreviewPane/usePrPane";
import { usePreviewCommentSender } from "./PrPreviewPane/usePreviewCommentSender";

export function PrPreviewPane({
	preview,
	session,
	sessionId,
	cwd,
	sendInput,
	onDecision,
}: PrPreviewPaneProps) {
	const options = previewPaneOptions(preview, sessionId, cwd, onDecision);
	const { isPr, screenshots, editable } = options;
	const pane = usePrPane(options);
	const sender = usePreviewCommentSender(
		session,
		sendInput,
		pane.pending?.quote,
		pane.onCancel,
	);

	return (
		<Box sx={prPreviewPaneSx} onDrop={pane.onDrop} onDragOver={pane.onDragOver}>
			<PrPreviewHeader preview={preview} draft={pane.chain.draft} />
			<PreviewLinks preview={preview} />
			<Divider />
			<PrPreviewContent pane={pane} screenshots={screenshots} />
			<PrPreviewFooter
				{...previewFooterProps({
					preview,
					pane,
					cwd,
					isPr,
					editable,
					sender,
					...previewRuleActions(
						sessionId,
						sendInput,
						pane.pending?.quote,
						pane.onCancel,
					),
				})}
			/>
			<CommentSentSnackbar
				sessionName={sender.sentTo}
				onClose={sender.clearSent}
			/>
		</Box>
	);
}
