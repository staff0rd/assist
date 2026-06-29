import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { assistVersion } from "./assistVersion";
import { useDaemonVersionContext } from "./useDaemonVersionContext";

export function VersionBadge() {
	const daemonVersion = useDaemonVersionContext();
	if (!assistVersion) return null;
	const mismatch = daemonVersion && daemonVersion !== assistVersion;
	return (
		<>
			<Typography
				variant="caption"
				sx={{ opacity: 0.4, userSelect: "none", lineHeight: 1 }}
			>
				v{assistVersion}
			</Typography>
			{mismatch && (
				<Tooltip
					title={`Daemon is running v${daemonVersion}, but this page was served by v${assistVersion}. Restart the daemon to match.`}
				>
					<WarningAmberIcon
						fontSize="small"
						color="warning"
						aria-label="Version mismatch"
					/>
				</Tooltip>
			)}
		</>
	);
}
