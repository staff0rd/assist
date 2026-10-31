import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";

const iconSx = { color: "primary.main" } as const;

export function PhoneListNavActions({
	onNewSession,
}: {
	onNewSession?: () => void;
}) {
	return (
		<IconButton aria-label="New session" sx={iconSx} onClick={onNewSession}>
			<AddIcon />
		</IconButton>
	);
}
