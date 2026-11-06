import { loadConfig } from "../../shared/loadConfig";
import { askQuestionEnabled } from "../askQuestion/askQuestionEnabled";
import { isLiveDaemonSession } from "../sessions/shared/isLiveDaemonSession";

function askInChat(reason: string): never {
	console.error(
		`Error: ${reason}; ask the user to perform the check in chat instead.`,
	);
	process.exit(1);
}

export async function requireCheckSession(): Promise<string> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		askInChat("not running in an assist session");
	if (!askQuestionEnabled(loadConfig()))
		askInChat("assist ask-check is disabled (sessions.askQuestion)");
	if (!(await isLiveDaemonSession(sessionId)))
		askInChat(
			`session ${sessionId} is not live in the assist daemon, so no preview pane can show the check`,
		);
	return sessionId;
}
