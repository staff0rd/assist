import { Box, Divider } from "@mui/material";
import { PrPreviewContent } from "./PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";
import { PreviewMetadataList } from "./PreviewMetadataList";
import { previewFooterProps } from "./previewFooterProps";
import { previewPaneCapabilities } from "./previewPaneCapabilities";
import { previewRuleAdder } from "./previewRuleAdder";
import { previewRuleCiter } from "./previewRuleCiter";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { usePrPane } from "./usePrPane";

export function PrPreviewPane({
	preview,
	sessionId,
	cwd,
	sendInput,
	onDecision,
}: PrPreviewPaneProps) {
	const { isPr, screenshots, editable } = previewPaneCapabilities(preview.kind);
	const pane = usePrPane({
		requestId: preview.requestId,
		sessionId,
		cwd,
		onDecision,
		isPr,
		screenshots,
		resolvedDraft: preview.draft === true,
		initialBody: preview.body,
		editable,
	});

	return (
		<Box sx={prPreviewPaneSx} onDrop={pane.onDrop} onDragOver={pane.onDragOver}>
			<PrPreviewHeader preview={preview} draft={pane.chain.draft} />
			<PreviewMetadataList items={preview.metadata ?? []} />
			<Divider />
			<PrPreviewContent pane={pane} screenshots={screenshots} />
			<PrPreviewFooter
				{...previewFooterProps({
					preview,
					pane,
					cwd,
					isPr,
					editable,
					onCite: previewRuleCiter(
						sessionId,
						sendInput,
						pane.pending?.quote,
						pane.onCancel,
					),
					onAddRule: previewRuleAdder(
						sessionId,
						sendInput,
						pane.pending?.quote,
						pane.onCancel,
					),
				})}
			/>
		</Box>
	);
}
