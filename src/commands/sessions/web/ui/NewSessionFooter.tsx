import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const HINTS = ["Enter start", "Shift+Enter newline", "Esc close"];

const footerSx = {
	alignItems: "center",
	px: 1.5,
	py: 1,
	borderTop: 1,
	borderColor: "divider",
	bgcolor: "action.hover",
} as const;

export function NewSessionFooter({ submitLabel }: { submitLabel: string }) {
	return (
		<Stack direction="row" spacing={1.5} sx={footerSx}>
			<Stack direction="row" spacing={1.5} sx={{ mr: "auto" }}>
				{HINTS.map((hint) => (
					<Typography key={hint} variant="caption" color="text.secondary">
						{hint}
					</Typography>
				))}
			</Stack>
			<Button type="submit" variant="contained" size="small">
				{submitLabel}
			</Button>
		</Stack>
	);
}
