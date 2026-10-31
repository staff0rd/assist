import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSegmented } from "../PhoneSegmented";

export function PhoneHarnessPicker({
	harnesses,
	value,
	onChange,
}: {
	harnesses: HarnessKind[];
	value: HarnessKind;
	onChange: (harness: HarnessKind) => void;
}) {
	if (harnesses.length < 2) return null;
	return (
		<>
			<Box sx={nodeListSx.label}>Harness</Box>
			<PhoneSegmented
				label="Harness"
				options={harnesses}
				value={value}
				onChange={(harness) => onChange(harness as HarnessKind)}
				mono
			/>
		</>
	);
}
