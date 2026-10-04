import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useRef } from "react";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { shortcutRegistry } from "../../../shortcutRegistry";
import { useCaptureHotkey } from "../../../useCaptureHotkey";

export function MenuButton({
	open,
	onOpen,
}: {
	open: boolean;
	onOpen: (anchor: HTMLElement) => void;
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	useCaptureHotkey(
		shortcutRegistry.openMenu.matches,
		useCallback(() => {
			if (buttonRef.current) onOpen(buttonRef.current);
		}, [onOpen]),
	);

	return (
		<Tooltip
			describeChild
			title={
				<ChordTooltipTitle
					label="Menu"
					chords={shortcutRegistry.openMenu.chords}
				/>
			}
		>
			<IconButton
				ref={buttonRef}
				onClick={(e) => onOpen(e.currentTarget)}
				size="small"
				sx={{ color: "inherit" }}
				aria-label="Open menu"
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
			>
				<MenuIcon fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
