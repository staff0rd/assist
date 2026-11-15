import { drivenSessionFor } from "../../../../shared/harnessAdapters/drivenSessionFor";
import { harnessLabel } from "../../../../shared/harnessAdapters/harnessLabel";
import { isHarnessKind } from "../../../../shared/isHarnessKind";

export function drivenLaunchTarget(value: unknown) {
	const harness = isHarnessKind(value) ? value : undefined;
	return {
		harness,
		label: harness ? harnessLabel(harness) : "Driven session",
		drivenSession: harness ? drivenSessionFor(harness) : undefined,
	};
}
