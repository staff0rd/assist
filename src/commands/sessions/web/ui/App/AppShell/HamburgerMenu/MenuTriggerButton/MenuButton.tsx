import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useRef } from "react";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";

export function MenuButton({
	open,
	onOpen,
}: {
	open: boolean;
	onOpen: (anchor: HTMLElement) => void;
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const { matches, chords } = useShortcut("openMenu");
	useCaptureHotkey(
		matches,
		useCallback(() => {
			if (buttonRef.current) onOpen(buttonRef.current);
		}, [onOpen]),
	);

	return (
		<Tooltip
			describeChild
			title={<ChordTooltipTitle label="Menu" chords={chords} />}
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
