import { Box, Button, Divider, Stack, useTheme } from "@mui/material";
import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../backlog/web/ui/components/MarkdownHtml";
import { MermaidDiagram } from "../../../../../backlog/web/ui/components/MermaidDiagram";
import { splitMarkdownSegments } from "../../../../../backlog/web/ui/components/splitMarkdownSegments";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { addCopyButtons } from "./ShowPane/addCopyButtons";
import { copyCodeOnClick } from "./ShowPane/copyCodeOnClick";
import { showBodySx } from "./ShowPane/showBodySx";

export function ShowPane({
	preview,
	onClose,
}: {
	preview: PrPreview;
	onClose: () => void;
}) {
	const mode = useTheme().palette.mode;
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
				<Box className="markdown">
					{segments.map((segment) =>
						segment.type === "mermaid" ? (
							<MermaidDiagram
								key={segment.key}
								source={segment.source}
								mode={mode}
							/>
						) : (
							<MarkdownHtml key={segment.key} html={segment.html} />
						),
					)}
				</Box>
			</Box>
			<Divider />
			<Stack direction="row" sx={{ p: 2, justifyContent: "flex-end" }}>
				<Button variant="outlined" onClick={onClose}>
					Close
				</Button>
			</Stack>
		</Box>
	);
}
