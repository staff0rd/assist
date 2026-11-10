import { harnessLabel } from "../../../../../../shared/harnessLabel";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import { PhoneSegmented } from "../PhoneSegmented";

export function PhoneHarnessPicker({
	choices,
	value,
	onChange,
}: {
	choices: HarnessKind[];
	value: HarnessKind;
	onChange: (harness: HarnessKind) => void;
}) {
	if (choices.length < 2) return null;
	return (
		<PhoneSegmented
			label="Harness"
			options={choices}
			value={value}
			onChange={(kind) => onChange(kind as HarnessKind)}
			optionLabel={(kind) => harnessLabel(kind as HarnessKind)}
		/>
	);
}
