import Tooltip from "@mui/material/Tooltip";
import type { ReactElement } from "react";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { useShortcut } from "../../../useShortcut";

export function DiffToggleTooltip({
	show,
	children,
}: {
	show: boolean;
	children: ReactElement;
}) {
	const { label, chords } = useShortcut("toggleDiff");
	return (
		<Tooltip
			describeChild
			title={show ? <ChordTooltipTitle label={label} chords={chords} /> : ""}
		>
			{children}
		</Tooltip>
	);
}
