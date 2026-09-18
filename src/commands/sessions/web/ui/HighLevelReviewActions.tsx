import { Button, Stack, Typography } from "@mui/material";

function prompt(failed: number, outstanding: number): string {
	const parts = [
		...(failed > 0
			? [`${failed} deterministic check${failed === 1 ? "" : "s"} failing`]
			: []),
		...(outstanding > 0
			? [
					`${outstanding} manual item${outstanding === 1 ? "" : "s"} left to tick`,
				]
			: []),
	];
	return parts.length > 0 ? parts.join(" · ") : "Every item is accounted for";
}

export function HighLevelReviewActions({
	failed,
	outstanding,
	onApprove,
	onRequestChanges,
}: {
	failed: number;
	outstanding: number;
	onApprove: () => void;
	onRequestChanges: () => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{ p: 2, alignItems: "center", justifyContent: "flex-end" }}
		>
			<Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
				{prompt(failed, outstanding)}
			</Typography>
			<Button color="error" variant="outlined" onClick={onRequestChanges}>
				Request changes
			</Button>
			<Button
				color="success"
				variant="contained"
				disabled={outstanding > 0}
				onClick={onApprove}
			>
				Approve
			</Button>
		</Stack>
	);
}
