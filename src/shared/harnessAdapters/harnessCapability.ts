import type { HarnessKind } from "../harnesses";
import { resolveHarness } from "./harnessLabel";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { resolveCapability } from "./resolveCapability";
import type { CapabilityId } from "./capabilityDefinitions";
import type { CapabilityStatus } from "./types";

export function harnessCapability(
	harness: HarnessKind | undefined,
	capability: CapabilityId,
): CapabilityStatus {
	return resolveCapability(
		harnessCapabilityDeclarations[resolveHarness(harness)],
		capability,
	);
}
