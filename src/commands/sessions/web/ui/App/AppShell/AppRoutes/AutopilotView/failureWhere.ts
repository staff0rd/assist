import type { AutopilotFailure } from "../../../../../../daemon/autopilot/AutopilotRecord";

/** "a1867 · Review", "a1867" or "" for a failure with no item or phase. */
export function failureWhere({ item, phase }: AutopilotFailure): string {
	return [item, phase].filter(Boolean).join(" · ");
}
