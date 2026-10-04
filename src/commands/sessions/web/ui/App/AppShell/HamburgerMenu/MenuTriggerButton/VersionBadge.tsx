import ButtonBase from "@mui/material/ButtonBase";
import { Link } from "react-router";
import { isUpdateReady } from "../../isUpdateReady";
import { useNodeUpdatesContext } from "../../useNodeUpdatesContext";
import { assistVersion } from "../../assistVersion";
import { DaemonMismatchWarning } from "./VersionBadge/DaemonMismatchWarning";
import { versionBadgeSx } from "./VersionBadge/versionBadgeSx";

export function VersionBadge() {
	const { entries } = useNodeUpdatesContext();
	if (!assistVersion) return null;
	const ready = entries.filter(isUpdateReady).length;
	return (
		<>
			<ButtonBase
				component={Link}
				to="/updates"
				aria-label={
					ready
						? `Updates: ${ready} node${ready > 1 ? "s have" : " has"} an update ready`
						: "Updates"
				}
				sx={versionBadgeSx(ready > 0)}
			>
				{ready > 0 && <span className="ready-dot" aria-hidden />}
				<span>v{assistVersion}</span>
				{ready > 0 && <span className="ready-count">{ready} ready</span>}
			</ButtonBase>
			<DaemonMismatchWarning />
		</>
	);
}
