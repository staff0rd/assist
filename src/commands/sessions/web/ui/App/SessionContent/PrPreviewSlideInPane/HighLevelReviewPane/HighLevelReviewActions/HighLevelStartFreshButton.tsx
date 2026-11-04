import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { useState } from "react";

export function HighLevelStartFreshButton({
	sliced,
	onRestart,
}: {
	sliced: boolean;
	onRestart: () => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button color="inherit" onClick={() => setOpen(true)}>
				Start fresh
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Start this review fresh?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{sliced
							? "Your ticks, comments and queued comments for this head are discarded, and the agent slices the PR again and rewrites the manual testing steps before the review reopens."
							: "Your ticks, comments and queued comments for this head are discarded and the review reopens."}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
					<Button
						color="error"
						onClick={() => {
							setOpen(false);
							onRestart();
						}}
					>
						Start fresh
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
