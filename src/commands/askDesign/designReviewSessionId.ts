import { isLiveDaemonSession } from "../sessions/shared/isLiveDaemonSession";

export async function designReviewSessionId(): Promise<string | undefined> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return undefined;
	return (await isLiveDaemonSession(sessionId)) ? sessionId : undefined;
}
