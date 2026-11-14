import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Props = {
	error: string | undefined;
	submitLabel: string;
	hint: string;
	disabled: boolean;
	onCancel: () => void;
};

export function RuleFormFooter({
	error,
	submitLabel,
	hint,
	disabled,
	onCancel,
}: Props) {
	return (
		<>
			{error && (
				<Typography variant="body2" color="error">
					{error}
				</Typography>
			)}
			<Box
				sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}
			>
				<Button
					type="submit"
					variant="contained"
					size="small"
					disabled={disabled}
				>
					{submitLabel}
				</Button>
				<Button variant="outlined" size="small" onClick={onCancel}>
					Cancel
				</Button>
				<Typography variant="caption" color="text.secondary">
					{hint}
				</Typography>
			</Box>
		</>
	);
}
