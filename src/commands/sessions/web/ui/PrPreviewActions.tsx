import { Button, Stack } from "@mui/material";

export function PrPreviewActions({
	onApprove,
	onReject,
}: {
	onApprove: () => void;
	onReject: () => void;
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
			<Button color="success" variant="contained" onClick={onApprove}>
				Approve
			</Button>
		</Stack>
	);
}
