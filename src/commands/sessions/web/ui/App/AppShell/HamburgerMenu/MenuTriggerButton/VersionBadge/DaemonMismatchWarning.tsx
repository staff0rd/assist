import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Tooltip from "@mui/material/Tooltip";
import { assistVersion } from "../../../assistVersion";
import { useDaemonVersionContext } from "../../../useDaemonVersionContext";

export function DaemonMismatchWarning() {
	const daemonVersion = useDaemonVersionContext();
	if (!daemonVersion || daemonVersion === assistVersion) return null;
	return (
		<Tooltip
			title={`Daemon is running v${daemonVersion}, but this page was served by v${assistVersion}. Restart the daemon to match.`}
		>
			<WarningAmberIcon
				fontSize="small"
				color="warning"
				aria-label="Version mismatch"
			/>
		</Tooltip>
	);
}
