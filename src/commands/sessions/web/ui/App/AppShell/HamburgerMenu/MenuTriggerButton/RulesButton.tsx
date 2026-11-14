import RuleIcon from "@mui/icons-material/Rule";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router";

export function RulesButton() {
	const navigate = useNavigate();
	return (
		<Tooltip title="Rules">
			<IconButton
				size="small"
				sx={{ color: "inherit" }}
				aria-label="Rules"
				onClick={() => navigate("/rules")}
			>
				<RuleIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
