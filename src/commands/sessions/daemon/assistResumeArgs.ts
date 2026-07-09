export function assistResumeArgs(session: {
	assistArgs: string[];
	claudeSessionId?: string;
}): string[] {
	const args = ["assist", ...session.assistArgs];
	return session.claudeSessionId
		? [...args, "--resume-session", session.claudeSessionId]
		: args;
}
