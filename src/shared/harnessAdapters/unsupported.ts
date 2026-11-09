import type { CapabilityStatus } from "./types";

export const supported: CapabilityStatus = { supported: true };

export function unsupported(
	reason: string,
	remediation: string,
	followUp?: string,
): CapabilityStatus {
	return followUp
		? { supported: false, reason, remediation, followUp }
		: { supported: false, reason, remediation };
}
