import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { FileData, ViewType } from "react-diff-view";
import { diffSx } from "../../diffSx";
import { FileDiff } from "../FileDiff";
import type { AddRuleRequest } from "../../formatAddRuleCommand";
import type { DiffComment } from "../../formatDiffComment";
import type { FileComment } from "../../formatFileComment";
import { filePath } from "../filePath";

export type DiffFileListProps = {
	files: FileData[];
	viewType: ViewType;
	cwd: string;
	isCollapsed: (path: string) => boolean;
	onToggleCollapsed: (path: string) => void;
	onComment?: (comment: DiffComment) => void;
	onFileComment?: (comment: FileComment) => void;
	commentUnavailable?: string | undefined;
	onAddRule?: (request: AddRuleRequest) => void;
	emptyMessage: string;
};

export function DiffFileList({
	files,
	viewType,
	cwd,
	isCollapsed,
	onToggleCollapsed,
	onComment,
	onFileComment,
	commentUnavailable,
	onAddRule,
	emptyMessage,
}: DiffFileListProps) {
	if (files.length === 0)
		return (
			<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
				{emptyMessage}
			</Typography>
		);

	return (
		<Box sx={[diffSx, { p: 1 }]}>
			{files.map((file) => (
				<FileDiff
					key={filePath(file)}
					file={file}
					viewType={viewType}
					cwd={cwd}
					collapsed={isCollapsed(filePath(file))}
					onToggle={() => onToggleCollapsed(filePath(file))}
					onComment={onComment}
					onFileComment={onFileComment}
					commentUnavailable={commentUnavailable}
					onAddRule={onAddRule}
				/>
			))}
		</Box>
	);
}
