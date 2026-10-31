import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import ListIcon from "@mui/icons-material/List";
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
				aria-label="Backlog"
				sx={iconSx}
				onClick={() => navigate("/backlog")}
			>
				<ListIcon />
			</IconButton>
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
