import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import { shellSx } from "./shellSx";

export function ShellDiscardButton({
	command,
	onDiscard,
}: {
	command: string;
	onDiscard: () => void;
}) {
	return (
		<IconButton
			size="small"
			aria-label={`Discard result of ${command}`}
			title="Discard — don't send with your message"
			sx={shellSx.discard}
			onClick={onDiscard}
		>
			<CloseRoundedIcon fontSize="small" />
		</IconButton>
	);
}
