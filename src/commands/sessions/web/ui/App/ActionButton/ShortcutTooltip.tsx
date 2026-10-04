import Tooltip from "@mui/material/Tooltip";
import type { ReactElement } from "react";
import { ChordTooltipTitle } from "../ChordTooltipTitle";
import type { ShortcutName } from "../shortcutRegistry";
import { useShortcut } from "../useShortcut";

export function ShortcutTooltip({
	label,
	shortcut,
	children,
}: {
	label: string;
	shortcut: ShortcutName | undefined;
	children: ReactElement;
}) {
	if (!shortcut) return children;
	return (
		<Tooltip
			describeChild
			title={<ShortcutTooltipTitle label={label} shortcut={shortcut} />}
		>
			{children}
		</Tooltip>
	);
}

function ShortcutTooltipTitle({
	label,
	shortcut,
}: {
	label: string;
	shortcut: ShortcutName;
}) {
	return (
		<ChordTooltipTitle label={label} chords={useShortcut(shortcut).chords} />
	);
}
