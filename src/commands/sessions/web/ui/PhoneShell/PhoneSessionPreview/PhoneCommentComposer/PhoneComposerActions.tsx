import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const barSx = {
	flex: "none",
	display: "flex",
	flexDirection: "column",
	gap: 1,
	px: 2,
	pt: 1.25,
	pb: 1.5,
	borderTop: 1,
	borderColor: "divider",
} as const;

export function PhoneComposerActions({
	disabled,
	editing,
	unavailable,
	onSend,
	onQueue,
	onAddRule,
}: {
	disabled: boolean;
	editing: boolean;
	unavailable: string | undefined;
	onSend: () => void;
	onQueue: () => void;
	onAddRule: (() => void) | undefined;
}) {
	return (
		<Box sx={barSx}>
			{unavailable && (
				<Typography variant="caption" color="text.secondary">
					{unavailable}
				</Typography>
			)}
			<Box sx={{ display: "flex", gap: 1 }}>
				<Button
					variant="outlined"
					sx={{ flex: 1 }}
					disabled={disabled || Boolean(unavailable)}
					onClick={onSend}
				>
					Send to agent
				</Button>
				<Button
					variant="contained"
					disableElevation
					sx={{ flex: 1 }}
					disabled={disabled}
					onClick={onQueue}
				>
					{editing ? "Save" : "Add to review"}
				</Button>
			</Box>
			{onAddRule && (
				<Button variant="text" disabled={disabled} onClick={onAddRule}>
					Make this a rule…
				</Button>
			)}
		</Box>
	);
}
