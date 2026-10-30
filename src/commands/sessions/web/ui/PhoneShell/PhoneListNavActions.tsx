import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router";

const iconSx = { color: "primary.main" } as const;

export function PhoneListNavActions({
	onNewSession,
}: {
	onNewSession?: () => void;
}) {
	const navigate = useNavigate();
	return (
		<>
			<IconButton
				aria-label="History"
				sx={iconSx}
				onClick={() => navigate("/history")}
			>
				<HistoryIcon />
			</IconButton>
			<IconButton aria-label="New session" sx={iconSx} onClick={onNewSession}>
				<AddIcon />
			</IconButton>
		</>
	);
}
