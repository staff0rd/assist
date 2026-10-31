import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const buttonSx = { borderRadius: "12px", flex: 1 } as const;

export function PhoneQuestionActions({
	last,
	canAdvance,
	canAnswer,
	sending,
	onNext,
	onAnswer,
	onDismiss,
}: {
	last: boolean;
	canAdvance: boolean;
	canAnswer: boolean;
	sending: boolean;
	onNext: () => void;
	onAnswer: () => void;
	onDismiss: () => void;
}) {
	return (
		<Box sx={{ display: "flex", gap: 1, pt: 1 }}>
			<Button
				variant="outlined"
				color="error"
				sx={buttonSx}
				disabled={sending}
				onClick={onDismiss}
			>
				Dismiss
			</Button>
			{last ? (
				<Button
					variant="contained"
					disableElevation
					sx={buttonSx}
					disabled={!canAnswer || sending}
					onClick={onAnswer}
				>
					{sending ? "Sending…" : "Answer"}
				</Button>
			) : (
				<Button
					variant="contained"
					disableElevation
					sx={buttonSx}
					disabled={!canAdvance}
					onClick={onNext}
				>
					Next
				</Button>
			)}
		</Box>
	);
}
