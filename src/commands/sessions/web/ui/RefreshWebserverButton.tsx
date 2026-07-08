import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { useWebserverRestart } from "./useWebserverRestart";

const sx = { color: "inherit", mr: 1.5 } as const;

export function RefreshWebserverButton({
	reconnecting,
}: {
	reconnecting: boolean;
}) {
	const { pending, error, clearError, restart } =
		useWebserverRestart(reconnecting);

	return (
		<>
			<Tooltip title="Restart web server">
				<span>
					<IconButton sx={sx} disabled={pending} onClick={restart}>
						{pending ? <CircularProgress size={24} /> : <RefreshIcon />}
					</IconButton>
				</span>
			</Tooltip>
			<ErrorSnackbar error={error} onClose={clearError} />
		</>
	);
}
