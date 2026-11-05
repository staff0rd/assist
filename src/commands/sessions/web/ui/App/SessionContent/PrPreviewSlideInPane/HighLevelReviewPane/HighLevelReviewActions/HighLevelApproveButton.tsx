import { Box, Button, Tooltip } from "@mui/material";

export function HighLevelApproveButton({
	blocker,
	onApprove,
}: {
	blocker: string | undefined;
	onApprove: () => void;
}) {
	return (
		<Tooltip title={blocker ?? ""}>
			<Box component="span">
				<Button
					color="success"
					variant="contained"
					onClick={onApprove}
					disabled={blocker !== undefined}
				>
					Approve
				</Button>
			</Box>
		</Tooltip>
	);
}
