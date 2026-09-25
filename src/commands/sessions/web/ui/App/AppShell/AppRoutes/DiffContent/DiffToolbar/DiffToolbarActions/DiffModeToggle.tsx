import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import IconButton from "@mui/material/IconButton";
import type { DiffPanelMode } from "../../../toggleDiffPanel";

export function DiffModeToggle({
	mode,
	onToggleMode,
}: {
	mode: DiffPanelMode;
	onToggleMode: () => void;
}) {
	const full = mode === "full";
	const label = full
		? "Show terminal beside diff"
		: "Fill the window with diff";
	const Icon = full ? CloseFullscreenIcon : OpenInFullIcon;

	return (
		<IconButton
			size="small"
			onClick={onToggleMode}
			title={label}
			aria-label={label}
			aria-pressed={full}
			sx={{
				color: full ? "text.primary" : "text.disabled",
				"&:hover": { color: "text.primary" },
			}}
		>
			<Icon sx={{ fontSize: 16 }} />
		</IconButton>
	);
}
