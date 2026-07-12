import { cleanupSignal } from "./resolvePhaseResult";
import { verifyResumeConversation } from "./verifyResumeConversation";

export async function verifyPhaseResume(
	itemId: number,
	resumeSessionId: string,
	phaseLabel: string,
): Promise<boolean> {
	if (!(await verifyResumeConversation(itemId, resumeSessionId, phaseLabel)))
		return false;
	cleanupSignal();
	return true;
}
