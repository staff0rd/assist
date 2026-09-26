import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../shared/harnessLabel";
import { checkedRadio } from "./checkedRadio";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";
import type { useDraftFocus } from "./useDraftFocus";

export function HarnessRow({
	harness,
	harnesses,
	onChange,
	offset,
	focus,
	locked,
}: {
	harness: HarnessKind;
	harnesses: HarnessKind[];
	onChange: (harness: HarnessKind) => void;
	offset: number;
	focus: ReturnType<typeof useDraftFocus>;
	locked: boolean;
}) {
	return (
		<Box sx={{ display: "flex", ml: `${offset}px` }}>
			<SegmentedRadioGroup
				label="Harness"
				options={harnesses}
				value={locked ? "claude" : harness}
				locked={locked}
				onChange={(choice) => onChange(choice as HarnessKind)}
				optionLabel={(choice) => harnessLabel(choice as HarnessKind)}
				groupRef={focus.harnessRef}
				autoFocus={focus.autoFocus === "harness"}
				onTrack={focus.trackHarness}
				onToggleRow={() => checkedRadio(focus.modeRef.current)?.focus()}
			/>
		</Box>
	);
}
