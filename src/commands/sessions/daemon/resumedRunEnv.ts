import { isPausePending } from "../../backlog/consumePause";
import type { ResumePlan } from "./restoreResumePlan";

export function resumedRunEnv(
	itemId: number | undefined,
	plan: ResumePlan,
): Record<string, string> | undefined {
	const env: Record<string, string> = {};
	if (plan.idle) env.ASSIST_RESUME_IDLE = "1";
	if (plan.prompt) env.ASSIST_RESUME_PROMPT = plan.prompt;
	if (itemId != null && isPausePending(itemId)) env.ASSIST_KEEP_PAUSE = "1";
	return Object.keys(env).length > 0 ? env : undefined;
}
