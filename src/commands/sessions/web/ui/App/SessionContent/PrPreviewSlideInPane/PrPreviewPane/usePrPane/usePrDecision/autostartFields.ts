import type { PreviewStartTarget } from "../../../../../../../../shared/PreviewDecision";
import type { PrDecisionDetails } from "../../../../../../PrDecisionDetails";

export type Autostart = boolean | PreviewStartTarget;

export function autostartFields(
	approved: boolean,
	autostart: Autostart,
): Pick<PrDecisionDetails, "autostart" | "startOn"> {
	if (!approved || autostart === false) return {};
	return autostart === true
		? { autostart: true }
		: { autostart: true, startOn: autostart };
}
