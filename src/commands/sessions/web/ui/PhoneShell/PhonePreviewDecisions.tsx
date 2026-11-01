import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const buttonSx = { borderRadius: "12px", flex: 1, fontWeight: 600 } as const;
const startSx = { ...buttonSx, flex: 1.3 } as const;

export function PhonePreviewDecisions({
	canStart,
	sending,
	onReject,
	onApprove,
	onApproveAndStart,
}: {
	canStart: boolean;
	sending: boolean;
	onReject: () => void;
	onApprove: () => void;
	onApproveAndStart: () => void;
}) {
	return (
		<Box sx={{ display: "flex", gap: 1 }}>
			<Button
				variant="outlined"
				color="error"
				sx={buttonSx}
				disabled={sending}
				onClick={onReject}
			>
				Reject
			</Button>
			<Button
				variant={canStart ? "tonal" : "contained"}
				disableElevation
				sx={buttonSx}
				disabled={sending}
				onClick={onApprove}
			>
				Approve
			</Button>
			{canStart && (
				<Button
					variant="contained"
					disableElevation
					sx={startSx}
					disabled={sending}
					onClick={onApproveAndStart}
				>
					Approve & start
				</Button>
			)}
		</Box>
	);
}
