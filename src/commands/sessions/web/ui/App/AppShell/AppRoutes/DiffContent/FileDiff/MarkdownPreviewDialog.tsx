import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import type { AddRuleRequest } from "../../formatAddRuleCommand";
import type { FileComment } from "../../formatFileComment";
import { MarkdownPreviewBody } from "./MarkdownPreviewDialog/MarkdownPreviewBody";
import { useFileContent } from "../../useFileContent";

export function MarkdownPreviewDialog({
	cwd,
	path,
	onComment,
	onAddRule,
	unavailable,
	onClose,
}: {
	cwd: string | undefined;
	path: string;
	onComment?: ((comment: FileComment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	unavailable?: string | undefined;
	onClose: () => void;
}) {
	const state = useFileContent(cwd, path);

	return (
		<Dialog open onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle sx={{ fontFamily: "monospace", fontSize: "1rem" }}>
				{path}
			</DialogTitle>
			<DialogContent dividers>
				<MarkdownPreviewBody
					state={state}
					cwd={cwd}
					path={path}
					onComment={onComment}
					onAddRule={onAddRule}
					unavailable={unavailable}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
