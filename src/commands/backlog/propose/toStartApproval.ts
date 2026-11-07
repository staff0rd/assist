import type {
	PreviewDecision,
	PreviewStartTarget,
} from "../../sessions/shared/PreviewDecision";

export type StartApproval = {
	autostart: boolean;
	startOn?: PreviewStartTarget;
};

export function toStartApproval(decision: PreviewDecision): StartApproval {
	const autostart = decision.autostart === true;
	return autostart && decision.startOn
		? { autostart, startOn: decision.startOn }
		: { autostart };
}
