import ButtonBase from "@mui/material/ButtonBase";
import Tooltip from "@mui/material/Tooltip";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";
import { isUpdateReady } from "../../isUpdateReady";
import { useNodeUpdatesContext } from "../../useNodeUpdatesContext";
import { assistVersion } from "../../assistVersion";
import { DaemonMismatchWarning } from "./VersionBadge/DaemonMismatchWarning";
import { versionBadgeSx } from "./VersionBadge/versionBadgeSx";

export function VersionBadge() {
	const { entries } = useNodeUpdatesContext();
	const navigate = useNavigate();
	const openNodes = useCallback(() => navigate("/nodes"), [navigate]);
	const { matches, chords } = useShortcut("openUpdates");
	useCaptureHotkey(matches, openNodes);
	if (!assistVersion) return null;
	const ready = entries.filter(isUpdateReady).length;
	return (
		<>
			<Tooltip
				describeChild
				placement="top-end"
				title={<ChordTooltipTitle label="Nodes" chords={chords} />}
			>
				<ButtonBase
					component={Link}
					to="/nodes"
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
			</Tooltip>
			<DaemonMismatchWarning />
		</>
	);
}
