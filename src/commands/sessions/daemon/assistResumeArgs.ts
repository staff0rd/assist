import { acceptsResumeSession } from "../../../shared/acceptsResumeSession";

export function assistResumeArgs(session: {
	assistArgs: string[];
	resumeSessionId?: string;
}): string[] {
	const args = ["assist", ...session.assistArgs];
	return session.resumeSessionId && acceptsResumeSession(session.assistArgs)
		? [...args, "--resume-session", session.resumeSessionId]
		: args;
}
