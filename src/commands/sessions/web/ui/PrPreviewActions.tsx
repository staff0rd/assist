import { Button, Stack } from "@mui/material";

export function PrPreviewActions({
	commentCount,
	onApprove,
	onReject,
	onRequestChanges,
}: {
	commentCount: number;
	onApprove: () => void;
	onReject: () => void;
	onRequestChanges: () => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{ p: 2, justifyContent: "flex-end" }}
		>
			<Button color="error" variant="outlined" onClick={onReject}>
				Reject
			</Button>
			{commentCount > 0 && (
				<Button color="warning" variant="contained" onClick={onRequestChanges}>
					Request changes ({commentCount})
				</Button>
			)}
			<Button color="success" variant="contained" onClick={onApprove}>
				Approve
			</Button>
		</Stack>
	);
}
