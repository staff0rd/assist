import type {
	PreviewDecision,
	PreviewStartTarget,
} from "../../sessions/shared/PreviewDecision";

export type StartApproval = {
	autostart: boolean;
	startOn?: PreviewStartTarget;
	yolo?: boolean;
};

export function toStartApproval(decision: PreviewDecision): StartApproval {
	const autostart = decision.autostart === true;
	return {
		autostart,
		...(autostart && decision.startOn && { startOn: decision.startOn }),
		...(autostart && decision.startYolo === true && { yolo: true }),
	};
}
