import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";

export function RewindDialog({
	phaseName,
	onConfirm,
	onCancel,
}: {
	phaseName: string;
	onConfirm: (reason: string) => void;
	onCancel: () => void;
}) {
	const [reason, setReason] = useState("");
	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>Rewind to {phaseName}?</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					This will mark all later phases as incomplete.
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={3}
					size="small"
					placeholder="Reason for rewinding..."
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
				<Button
					variant="contained"
					color="warning"
					disabled={reason.trim().length === 0}
					onClick={() => onConfirm(reason.trim())}
				>
					Rewind
				</Button>
			</DialogActions>
		</Dialog>
	);
}
