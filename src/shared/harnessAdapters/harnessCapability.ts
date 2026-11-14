import type { HarnessKind } from "../harnesses";
import { resolveHarness } from "./harnessLabel";
import { harnessCapabilityDeclarations } from "./harnessCapabilityDeclarations";
import { resolveCapability } from "./resolveCapability";
import type { CapabilityId } from "./capabilityDefinitions";
import type { CapabilityStatus } from "./types";
import { unsupported } from "./unsupported";

export function harnessCapability(
	harness: HarnessKind | undefined,
	capability: CapabilityId,
): CapabilityStatus {
	const kind = resolveHarness(harness);
	const declarations = harnessCapabilityDeclarations[kind] as
		| (typeof harnessCapabilityDeclarations)[HarnessKind]
		| undefined;
	if (!declarations)
		return unsupported(
			`This app does not recognise the ${kind} harness.`,
			"Update the app to a version that supports it.",
		);
	return resolveCapability(declarations, capability);
}
