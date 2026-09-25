import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router";

export function ConfigButton() {
	const navigate = useNavigate();

	return (
		<Tooltip title="Config">
			<IconButton
				size="small"
				sx={{ color: "inherit" }}
				aria-label="Config"
				onClick={() => navigate("/config")}
			>
				<SettingsIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
