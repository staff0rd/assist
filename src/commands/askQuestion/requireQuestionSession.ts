import { loadConfig } from "../../shared/loadConfig";
import { isLiveDaemonSession } from "../sessions/shared/isLiveDaemonSession";
import { askQuestionEnabled } from "./askQuestionEnabled";

function useBuiltIn(reason: string): never {
	console.error(`Error: ${reason}; use the built-in AskUserQuestion tool.`);
	process.exit(1);
}

export async function requireQuestionSession(): Promise<string> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		useBuiltIn("not running in an assist session");
	if (!askQuestionEnabled(loadConfig()))
		useBuiltIn("assist ask-question is disabled (sessions.askQuestion)");
	if (!(await isLiveDaemonSession(sessionId)))
		useBuiltIn(
			`session ${sessionId} is not live in the assist daemon, so no preview pane can show the form`,
		);
	return sessionId;
}
