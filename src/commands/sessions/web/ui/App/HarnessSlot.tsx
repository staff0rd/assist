import ButtonBase from "@mui/material/ButtonBase";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { reviewAlternateSx } from "./reviewAlternateSx";

// An invisible copy of the harness button keeps its column as wide as on rows that offer it.
export function HarnessSlot({ harness }: { harness: HarnessKind }) {
	return (
		<ButtonBase
			disabled
			aria-hidden
			tabIndex={-1}
			sx={[reviewAlternateSx.button, reviewAlternateSx.slot]}
		>
			{harnessLabel(harness)}
		</ButtonBase>
	);
}
