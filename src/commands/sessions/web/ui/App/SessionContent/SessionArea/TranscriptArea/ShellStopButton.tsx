import StopRoundedIcon from "@mui/icons-material/StopRounded";
import Button from "@mui/material/Button";
import { shellSx } from "./shellSx";

export function ShellStopButton({ onStop }: { onStop: () => void }) {
	return (
		<Button
			size="small"
			color="error"
			startIcon={<StopRoundedIcon fontSize="small" />}
			aria-label="Stop command"
			title="Stop command (Esc)"
			sx={shellSx.stop}
			onClick={onStop}
		>
			Stop
		</Button>
	);
}
