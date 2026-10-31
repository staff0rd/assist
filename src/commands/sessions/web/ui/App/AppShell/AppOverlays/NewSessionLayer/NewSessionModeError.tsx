import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

export function NewSessionModeError({
	error,
	onRetry,
}: {
	error: string | undefined;
	onRetry: (() => void) | undefined;
}) {
	if (!error) return null;
	return (
		<Alert
			severity="error"
			sx={{ mx: 2, my: 1 }}
			action={
				onRetry && (
					<Button color="inherit" size="small" onClick={onRetry}>
						Retry
					</Button>
				)
			}
		>
			Couldn't load this repo's default mode ({error}). Pick a mode or retry.
		</Alert>
	);
}
