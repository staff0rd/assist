import Box from "@mui/material/Box";
import { PhoneSheetButton } from "../PhoneSheetButton";

export function PhoneEndConfirm({
	onEnd,
	onCancel,
}: {
	onEnd: () => void;
	onCancel: () => void;
}) {
	return (
		<>
			<Box sx={{ px: 2.5, fontSize: 15, color: "text.secondary" }}>
				This stops the running session and kills its process.
			</Box>
			<PhoneSheetButton color="error" onClick={onEnd}>
				End session
			</PhoneSheetButton>
			<PhoneSheetButton variant="outlined" onClick={onCancel}>
				Cancel
			</PhoneSheetButton>
		</>
	);
}
