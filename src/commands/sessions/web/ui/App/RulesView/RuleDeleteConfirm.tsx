import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useProposal } from "./useProposal";

type Props = {
	label: string;
	scopeName: string;
	onConfirm: () => Promise<string | undefined>;
	onCancel: () => void;
};

export function RuleDeleteConfirm({
	label,
	scopeName,
	onConfirm,
	onCancel,
}: Props) {
	const { error, sending, run } = useProposal();
	const confirm = () => run(onConfirm);

	return (
		<Box
			sx={(t) => ({
				gridColumn: "2 / 4",
				display: "flex",
				flexWrap: "wrap",
				alignItems: "center",
				gap: 1,
				px: 1.5,
				py: 1,
				borderRadius: 1,
				bgcolor: alpha(t.palette.error.main, 0.09),
			})}
		>
			<Typography variant="body2">
				Delete “{label}” from {scopeName}?
			</Typography>
			<Button
				variant="contained"
				color="error"
				size="small"
				disabled={sending}
				onClick={confirm}
			>
				Send for approval
			</Button>
			<Button variant="outlined" size="small" onClick={onCancel}>
				Keep it
			</Button>
			{error && (
				<Typography variant="body2" color="error" sx={{ flexBasis: "100%" }}>
					{error}
				</Typography>
			)}
		</Box>
	);
}
