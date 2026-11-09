import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import {
	harnessLabel,
	legacyDefaultHarness,
	resolveHarness,
} from "../../../../../../shared/harnessLabel";
import { tokenBadgeSx } from "../../designSystem/tokenBadgeSx";

const sx = tokenBadgeSx("neutral");

export function HarnessBadge({ harness }: { harness?: HarnessKind }) {
	if (resolveHarness(harness) === legacyDefaultHarness) return null;
	return (
		<Box component="span" sx={sx}>
			{harnessLabel(harness).toLowerCase()}
		</Box>
	);
}
