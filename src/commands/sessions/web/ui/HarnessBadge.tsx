import Chip from "@mui/material/Chip";
import type { HarnessKind } from "../../../../shared/harnesses";
import { harnessLabel, resolveHarness } from "../../../../shared/harnessLabel";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function HarnessBadge({ harness }: { harness?: HarnessKind }) {
	if (resolveHarness(harness) === "claude") return null;
	return (
		<Chip
			label={harnessLabel(harness)}
			size="small"
			color="secondary"
			variant="outlined"
			sx={chipSx}
		/>
	);
}
