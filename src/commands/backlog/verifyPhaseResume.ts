import type { HarnessKind } from "../../shared/harnesses";
import { cleanupSignal } from "./resolvePhaseResult";
import { verifyResumeConversation } from "./verifyResumeConversation";

export async function verifyPhaseResume(
	itemId: number,
	resumeSessionId: string,
	phaseLabel: string,
	harness?: HarnessKind,
): Promise<boolean> {
	if (
		!(await verifyResumeConversation(
			itemId,
			resumeSessionId,
			phaseLabel,
			harness,
		))
	)
		return false;
	cleanupSignal();
	return true;
}
