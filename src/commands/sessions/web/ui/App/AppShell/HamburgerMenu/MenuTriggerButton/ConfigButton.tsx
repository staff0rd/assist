import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { shortcutRegistry } from "../../../shortcutRegistry";
import { useCaptureHotkey } from "../../../useCaptureHotkey";

export function ConfigButton() {
	const navigate = useNavigate();
	const openConfig = useCallback(() => navigate("/config"), [navigate]);
	useCaptureHotkey(shortcutRegistry.openConfig.matches, openConfig);

	return (
		<Tooltip
			describeChild
			title={
				<ChordTooltipTitle
					label="Config"
					chords={shortcutRegistry.openConfig.chords}
				/>
			}
		>
			<IconButton
				size="small"
				sx={{ color: "inherit" }}
				aria-label="Config"
				onClick={openConfig}
			>
				<SettingsIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
