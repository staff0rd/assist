import Box from "@mui/material/Box";
import { PhoneSheetButton } from "../PhoneSheetButton";

export function PhoneStartOverConfirm({
	onStartOver,
	onCancel,
}: {
	onStartOver: () => void;
	onCancel: () => void;
}) {
	return (
		<>
			<Box sx={{ px: 2.5, fontSize: 15, color: "text.secondary" }}>
				The conversation history is discarded. This stops the running process
				and starts a new conversation with only the initial prompt, or opens
				idle if there was none.
			</Box>
			<PhoneSheetButton color="error" onClick={onStartOver}>
				Start over session
			</PhoneSheetButton>
			<PhoneSheetButton variant="outlined" onClick={onCancel}>
				Cancel
			</PhoneSheetButton>
		</>
	);
}
