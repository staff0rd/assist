import { Box, Divider } from "@mui/material";
import { PrPreviewContent } from "./PrPreviewPane/PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewPane/PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";
import { PreviewMetadataList } from "./PreviewMetadataList";
import { previewFooterProps } from "./PrPreviewPane/previewFooterProps";
import { previewPaneOptions } from "./PrPreviewPane/previewPaneOptions";
import { previewRuleAdder } from "./PrPreviewPane/previewRuleAdder";
import { previewRuleCiter } from "./PrPreviewPane/previewRuleCiter";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { usePrPane } from "./PrPreviewPane/usePrPane";

export function PrPreviewPane({
	preview,
	sessionId,
	cwd,
	sendInput,
	onDecision,
}: PrPreviewPaneProps) {
	const options = previewPaneOptions(preview, sessionId, cwd, onDecision);
	const { isPr, screenshots, editable } = options;
	const pane = usePrPane(options);

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
