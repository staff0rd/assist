import TerminalIcon from "@mui/icons-material/Terminal";
import Button from "@mui/material/Button";

export function ShowSessionButton({
	shown,
	onToggle,
}: {
	shown: boolean;
	onToggle: () => void;
}) {
	return (
		<Button
			size="small"
			variant={shown ? "outlined" : "text"}
			aria-pressed={shown}
			onClick={onToggle}
			startIcon={<TerminalIcon />}
			sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
		>
			{shown ? "Hide session" : "Show session"}
		</Button>
	);
}
