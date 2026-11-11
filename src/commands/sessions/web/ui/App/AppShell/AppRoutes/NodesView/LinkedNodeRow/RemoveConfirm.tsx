import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { nodeDetailSx } from "../nodeRowSx";

type RemoveConfirmProps = {
	name: string;
	busy: boolean;
	onKeep: () => void;
	onRemove: () => void;
};

export function RemoveConfirm({
	name,
	busy,
	onKeep,
	onRemove,
}: RemoveConfirmProps) {
	return (
		<Box
			role="group"
			aria-label={`Confirm removing ${name}`}
			sx={{
				...nodeDetailSx,
				display: "flex",
				alignItems: "center",
				gap: 1,
				flexWrap: "wrap",
				bgcolor: "action.hover",
				borderRadius: 1,
				px: 1.25,
				py: 1,
			}}
		>
			<Typography variant="body2" sx={{ flex: "1 1 220px" }}>
				Remove <strong>{name}</strong>? Its sessions disappear from this node.
				Sessions keep running there.
			</Typography>
			<Button size="small" onClick={onKeep} disabled={busy}>
				Keep
			</Button>
			<Button
				size="small"
				variant="contained"
				color="error"
				onClick={onRemove}
				disabled={busy}
			>
				Remove
			</Button>
		</Box>
	);
}
