import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { MarkdownHtml } from "../../../../../../../backlog/web/ui/components/MarkdownHtml";
import { renderMarkdown } from "../../../../../../../backlog/web/ui/components/renderMarkdown";

export function ReviewSynthesisDialog({
	content,
	onClose,
}: {
	content: string;
	onClose: () => void;
}) {
	return (
		<Dialog open onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Review synthesis</DialogTitle>
			<DialogContent dividers>
				<MarkdownHtml
					className="markdown"
					sx={{
						lineHeight: 1.7,
						"& p": { mt: 0 },
						"& a": { color: "primary.main" },
						wordBreak: "break-word",
					}}
					html={renderMarkdown(content)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
