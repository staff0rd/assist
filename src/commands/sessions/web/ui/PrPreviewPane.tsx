import { Box, Chip, Divider, Typography } from "@mui/material";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { MarkdownView } from "./MarkdownView";
import { PrPreviewActions } from "./PrPreviewActions";

export function PrPreviewPane({
	preview,
	onApprove,
	onReject,
}: {
	preview: PrPreview;
	onApprove: () => void;
	onReject: () => void;
}) {
	const isNew = preview.prNumber === null;
	return (
		<Box
			sx={{
				flex: 1,
				minWidth: 0,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				borderLeft: 1,
				borderColor: "divider",
				bgcolor: "background.paper",
			}}
		>
			<Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
				<Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
					{preview.title}
				</Typography>
				<Chip
					size="small"
					label={isNew ? "New PR" : `Update #${preview.prNumber}`}
					color={isNew ? "success" : "info"}
				/>
			</Box>
			<Divider />
			<MarkdownView content={preview.body} />
			<Divider />
			<PrPreviewActions onApprove={onApprove} onReject={onReject} />
		</Box>
	);
}
