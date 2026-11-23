import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

export function PauseBanner({
	reason,
	busy,
	onResume,
}: {
	reason: string;
	busy: boolean;
	onResume: () => void;
}) {
	return (
		<Alert
			severity="error"
			sx={{ mb: 3 }}
			action={
				<Button
					variant="contained"
					size="small"
					disabled={busy}
					onClick={onResume}
				>
					Resume
				</Button>
			}
		>
			<strong>Paused after a failure.</strong> {reason}. No more ticks run until
			you resume.
		</Alert>
	);
}
