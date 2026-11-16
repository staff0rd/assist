import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import type { HarnessKind } from "../../../shared/harnesses";

export function startsDriven(harness: HarnessKind | undefined): boolean {
	return (
		harness !== undefined &&
		harnessCapability(harness, "session.driven").supported
	);
}
