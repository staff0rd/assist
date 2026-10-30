import { Button, Stack, Typography } from "@mui/material";

export function QuestionActions({
	answered,
	total,
	onAnswer,
	onDismiss,
}: {
	answered: number;
	total: number;
	onAnswer: () => void;
	onDismiss: () => void;
}) {
	const ready = answered === total;
	return (
		<Stack direction="row" spacing={1} sx={{ p: 2, alignItems: "center" }}>
			<Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
				{ready && total > 1
					? "All questions answered"
					: `${answered} of ${total} answered`}
			</Typography>
			<Button color="error" variant="outlined" onClick={onDismiss}>
				Dismiss
			</Button>
			<Button
				color="success"
				variant="contained"
				disabled={!ready}
				onClick={onAnswer}
			>
				Answer
			</Button>
		</Stack>
	);
}
