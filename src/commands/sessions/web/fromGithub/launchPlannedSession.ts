import {
	type GithubAssistMode,
	githubAssistModes,
} from "../../../../shared/githubAssistModes";
import { requestAssistSession } from "../../shared/requestAssistSession";
import { requestPromptSession } from "../../shared/requestPromptSession";

export function launchPlannedSession(plan: {
	cwd: string;
	prompt: string;
	mode?: GithubAssistMode;
}): Promise<string> {
	return plan.mode
		? requestAssistSession(
				[...githubAssistModes[plan.mode], plan.prompt],
				plan.cwd,
			)
		: requestPromptSession(plan.prompt, plan.cwd);
}
