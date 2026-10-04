import Tab, { type TabProps } from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { navTabChord } from "./NavTab/navTabChord";

export function NavTab({
	index,
	label,
	...props
}: TabProps & { index: number; label: string }) {
	return (
		<Tooltip
			describeChild
			title={<ChordTooltipTitle label={label} chords={[navTabChord(index)]} />}
		>
			<Tab label={label} {...props} />
		</Tooltip>
	);
}
