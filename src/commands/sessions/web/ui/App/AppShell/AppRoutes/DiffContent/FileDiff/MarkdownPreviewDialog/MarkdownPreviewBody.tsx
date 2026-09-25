import { Alert, Box, CircularProgress } from "@mui/material";
import { MarkdownBlock } from "../../../../../../../../../backlog/web/ui/components/MarkdownBlock";
import type { FileContentState } from "../../../fetchFileContent";
import { FileCommentLayer } from "../../../FileCommentLayer";
import type { AddRuleRequest } from "../../../formatAddRuleCommand";
import type { FileComment } from "../../../formatFileComment";

export function MarkdownPreviewBody({
	state,
	cwd,
	path,
	onComment,
	onAddRule,
	unavailable,
}: {
	state: FileContentState;
	cwd: string | undefined;
	path: string;
	onComment?: ((comment: FileComment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	unavailable?: string | undefined;
}) {
	if (state.status === "loading")
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
				<CircularProgress size={24} />
			</Box>
		);

	if (state.status === "absent")
		return (
			<Alert severity="info">This file is no longer in the working tree.</Alert>
		);

	if (state.status === "too-large")
		return (
			<Alert severity="info">
				This file is too large to display (over 2 MB).
			</Alert>
		);

	if (state.status !== "ready")
		return <Alert severity="error">Couldn't load this file.</Alert>;

	return (
		<FileCommentLayer
			path={path}
			cwd={cwd}
			source={state.content}
			onComment={onComment}
			onAddRule={onAddRule}
			unavailable={unavailable}
		>
			<MarkdownBlock content={state.content} renderMermaid wide />
		</FileCommentLayer>
	);
}
