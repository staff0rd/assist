import { Box, Button, Divider, Stack } from "@mui/material";
import { useMemo } from "react";
import { MarkdownHtml } from "../../../../../../backlog/web/ui/components/MarkdownHtml";
import { renderMarkdown } from "../../../../../../backlog/web/ui/components/renderMarkdown";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { showBodySx } from "./ShowPane/showBodySx";

export function ShowPane({
	preview,
	onClose,
}: {
	preview: PrPreview;
	onClose: () => void;
}) {
	const html = useMemo(() => renderMarkdown(preview.body), [preview.body]);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<Box sx={showBodySx}>
				<MarkdownHtml className="markdown" html={html} />
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
