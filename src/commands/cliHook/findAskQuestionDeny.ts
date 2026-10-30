import { loadConfig } from "../../shared/loadConfig";
import type { HookDecision } from "./resolvePermission";

export function findAskQuestionDeny(
	questionsJson: string,
): HookDecision | undefined {
	if (process.env.ASSIST_SESSION !== "1") return undefined;
	if (!loadConfig().sessions?.askQuestion) return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: `Do not use AskUserQuestion in assist sessions: the user answers from the web preview pane, which cannot drive the terminal prompt. Write the same input as JSON to a scratch file and run \`assist ask-question --json - < <file>\` as a background task, doing no other work until it returns. It prints the same answer text AskUserQuestion would. The input to write:\n${questionsJson}`,
	};
}
