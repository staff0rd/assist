import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { marked } from "marked";
import type { ReviewSynthesisState } from "./useReviewSynthesis";

export function ReviewSynthesisDialog({
	state,
	onClose,
}: {
	state: ReviewSynthesisState;
	onClose: () => void;
}) {
	return (
		<Dialog open onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Review synthesis</DialogTitle>
			<DialogContent dividers>
				{state.status === "loading" && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress size={24} />
					</Box>
				)}
				{state.status === "error" && (
					<Alert severity="error">
						Couldn't load the review synthesis. Try again once the review has
						finished.
					</Alert>
				)}
				{state.status === "absent" && (
					<Alert severity="info">
						No review synthesis is available for this branch yet.
					</Alert>
				)}
				{state.status === "ready" && (
					<Box
						className="markdown"
						sx={{ lineHeight: 1.7, "& p": { mt: 0 }, wordBreak: "break-word" }}
						dangerouslySetInnerHTML={{
							__html: marked.parse(state.content) as string,
						}}
					/>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
