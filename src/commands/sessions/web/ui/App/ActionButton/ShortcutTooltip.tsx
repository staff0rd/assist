import Tooltip from "@mui/material/Tooltip";
import type { ReactElement } from "react";
import { ChordTooltipTitle } from "../ChordTooltipTitle";
import { type ShortcutName, shortcutRegistry } from "../shortcutRegistry";

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
			title={
				<ChordTooltipTitle
					label={label}
					chords={shortcutRegistry[shortcut].chords}
				/>
			}
		>
			{children}
		</Tooltip>
	);
}
