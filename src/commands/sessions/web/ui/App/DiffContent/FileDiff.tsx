import Box from "@mui/material/Box";
import { useState } from "react";
import { gapSx } from "../diffGaps/gapSx";
import { diffFileDomId } from "./diffFileDomId";
import { ExpandableFileBody } from "./FileDiff/ExpandableFileBody";
import { FileDiffHeader } from "./FileDiffHeader";
import type { FileDiffProps } from "./FileDiff/FileDiffProps";
import { isMarkdownPath } from "./FileDiff/isMarkdownPath";
import { MarkdownPreviewDialog } from "./FileDiff/MarkdownPreviewDialog";
import { slateFileCardSx } from "./FileDiff/slateFileCardSx";
import { useExpandableFile } from "./FileDiff/useExpandableFile";
import { filePath } from "./filePath";

export function FileDiff({
	file,
	viewType,
	cwd,
	collapsed,
	onToggle,
	onComment,
	onFileComment,
	commentUnavailable,
	onAddRule,
}: FileDiffProps) {
	const [previewOpen, setPreviewOpen] = useState(false);
	const path = filePath(file);
	const { expanded, expansion } = useExpandableFile(file, path);

	return (
		<Box id={diffFileDomId(path)} sx={[{ mb: 3 }, slateFileCardSx, gapSx]}>
			<FileDiffHeader
				path={path}
				collapsed={collapsed}
				onToggle={onToggle}
				onPreview={
					isMarkdownPath(path) && file.type !== "delete"
						? () => setPreviewOpen(true)
						: undefined
				}
			/>
			{previewOpen && (
				<MarkdownPreviewDialog
					cwd={cwd}
					path={path}
					onComment={onFileComment}
					onAddRule={onAddRule}
					unavailable={commentUnavailable}
					onClose={() => setPreviewOpen(false)}
				/>
			)}
			{!collapsed && (
				<ExpandableFileBody
					path={path}
					cwd={cwd}
					viewType={viewType}
					expanded={expanded}
					expansion={expansion}
					onComment={onComment}
					onAddRule={onAddRule}
				/>
			)}
		</Box>
	);
}
