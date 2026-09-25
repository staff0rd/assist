import { Button, Stack, Typography } from "@mui/material";
import type { MiroAnchorSelection } from "./useMiroAnchorSelection";

function prompt(selection: MiroAnchorSelection): string {
	if (selection.topLeft === null) return "Click the top-left box";
	if (selection.bottomRight === null) return "Now click the bottom-right box";
	return "Both anchors picked";
}

export function MiroBoardActions({
	selection,
	onConfirm,
	onReject,
}: {
	selection: MiroAnchorSelection;
	onConfirm: () => void;
	onReject: () => void;
}) {
	const ready = selection.topLeft !== null && selection.bottomRight !== null;

	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{ p: 2, alignItems: "center", justifyContent: "flex-end" }}
		>
			<Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
				{prompt(selection)}
			</Typography>
			<Button color="error" variant="outlined" onClick={onReject}>
				Cancel
			</Button>
			<Button variant="outlined" onClick={selection.reset}>
				Start over
			</Button>
			<Button
				color="success"
				variant="contained"
				disabled={!ready}
				onClick={onConfirm}
			>
				Extract boxes
			</Button>
		</Stack>
	);
}
