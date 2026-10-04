import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";

export function ConfigButton() {
	const navigate = useNavigate();
	const openConfig = useCallback(() => navigate("/config"), [navigate]);
	const { matches, chords } = useShortcut("openConfig");
	useCaptureHotkey(matches, openConfig);

	return (
		<Tooltip
			describeChild
			title={<ChordTooltipTitle label="Config" chords={chords} />}
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
