import { Box, Divider } from "@mui/material";
import type { PrPreview, PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrPreviewContent } from "./PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
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
	cwd,
	onDecision,
}: {
	preview: PrPreview;
	cwd?: string;
	onDecision: (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
		screenshots: string[],
	) => void;
}) {
	const pane = usePrPane(preview.requestId, cwd, onDecision);

	return (
		<Box sx={paneSx} onDrop={pane.onDrop} onDragOver={pane.onDragOver}>
			<PrPreviewHeader title={preview.title} prNumber={preview.prNumber} />
			<Divider />
			<PrPreviewContent body={preview.body} pane={pane} />
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
