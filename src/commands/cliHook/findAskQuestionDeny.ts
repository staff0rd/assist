import { loadConfig } from "../../shared/loadConfig";
import { sdkAgentEnv } from "../../shared/sdkAgentEnv";
import { askQuestionEnabled } from "../askQuestion/askQuestionEnabled";
import { inWebSession } from "../sessions/shared/inWebSession";
import { isLiveDaemonSession } from "../sessions/shared/isLiveDaemonSession";
import { previewWaitInstruction } from "../sessions/shared/previewWaitInstruction";
import type { HookDecision } from "./resolvePermission";

export async function findAskQuestionDeny(
	questionsJson: string,
): Promise<HookDecision | undefined> {
	if (!inWebSession()) return undefined;
	if (!askQuestionEnabled(loadConfig())) return undefined;
	if (!(await isLiveDaemonSession(process.env.ASSIST_SESSION_ID as string)))
		return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: `Do not use AskUserQuestion in assist sessions: the user answers from the web preview pane, which cannot drive the terminal prompt. Write the same input as JSON to a scratch file and run \`assist ask-question --json - < <file>\` ${previewWaitInstruction(process.env[sdkAgentEnv] === "1")}. It prints the same answer text AskUserQuestion would. The input to write:\n${questionsJson}`,
	};
}
