import { Button, Stack, Typography } from "@mui/material";

type Props = {
	unavailable: boolean;
	canSend: boolean;
	onSend: () => void;
	onCancel: () => void;
};

export function RuleAddComposerActions({
	unavailable,
	canSend,
	onSend,
	onCancel,
}: Props) {
	return (
		<>
			{unavailable && (
				<Typography variant="caption" color="text.secondary">
					Select a session card to add a rule.
				</Typography>
			)}
			<Stack
				direction="row-reverse"
				spacing={1}
				sx={{ justifyContent: "flex-start" }}
			>
				<Button
					size="small"
					variant="contained"
					disabled={!canSend}
					onClick={onSend}
				>
					Send
				</Button>
				<Button size="small" onClick={onCancel}>
					Cancel
				</Button>
			</Stack>
		</>
	);
}
