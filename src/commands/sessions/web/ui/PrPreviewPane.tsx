import { Box, Divider } from "@mui/material";
import type { PrPreview, PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrPreviewFooter } from "./PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { PreviewBody } from "./PreviewBody";
import { usePrPane } from "./usePrPane";

const paneSx = {
	flex: 1,
	minWidth: 0,
	height: "100%",
	display: "flex",
	flexDirection: "column",
	borderLeft: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
} as const;

export function PrPreviewPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => void;
}) {
	const pane = usePrPane(preview.requestId, onDecision);

	return (
		<Box sx={paneSx}>
			<PrPreviewHeader title={preview.title} prNumber={preview.prNumber} />
			<Divider />
			<PreviewBody
				content={preview.body}
				ranges={pane.ranges}
				wrapperRef={pane.wrapperRef}
				contentRef={pane.contentRef}
				dragRects={pane.dragRects}
				dragColor={pane.dragColor}
				onMouseDown={pane.onMouseDown}
			/>
			<PrPreviewFooter
				comments={pane.comments}
				commentColors={pane.commentColors}
				pending={pane.pending}
				onRemove={pane.remove}
				onDecision={pane.onDecide}
				onAdd={pane.onAdd}
				onCancel={pane.onCancel}
			/>
		</Box>
	);
}
