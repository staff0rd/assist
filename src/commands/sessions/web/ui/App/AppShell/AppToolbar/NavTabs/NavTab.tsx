import Box from "@mui/material/Box";
import Tab, { type TabProps } from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import { tokenBadgeSx } from "../../../../designSystem/tokenBadgeSx";
import { ChordTooltipTitle } from "../../../ChordTooltipTitle";
import { useShortcut } from "../../../useShortcut";
import { navTabChord } from "./NavTab/navTabChord";

const countSx = [tokenBadgeSx("secondary"), { ml: 0.75 }];

export function NavTab({
	index,
	label,
	count,
	...props
}: TabProps & { index: number; label: string; count?: number }) {
	const { chords } = useShortcut("navTab");
	return (
		<Tooltip
			describeChild
			title={
				<ChordTooltipTitle
					label={label}
					chords={[navTabChord(chords, index)]}
				/>
			}
		>
			<Tab
				label={
					count ? (
						<span>
							{label}
							<Box component="span" sx={countSx}>
								{count}
							</Box>
						</span>
					) : (
						label
					)
				}
				{...props}
			/>
		</Tooltip>
	);
}
