import type { CapabilityId } from "./capabilityDefinitions";
import type { CapabilityDeclarations, CapabilityStatus } from "./types";

export function resolveCapability(
	capabilities: CapabilityDeclarations,
	capability: CapabilityId,
): CapabilityStatus {
	const declaration = capabilities[capability];
	return typeof declaration === "function" ? declaration() : declaration;
}
