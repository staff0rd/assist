import { randomUUID } from "node:crypto";
import type { ResumeOutcome } from "./conversationResumeOutcome";
import type { Session } from "./createSession";
import { hasTranscriptOnDisk } from "./hasTranscriptOnDisk";
import { rememberSessionTitle } from "./rememberSessionTitle";
import { spawnClaude } from "./spawnClaude";

export type RespawnPlan = {
	spawn: () => Session["pty"];
	status: Session["status"];
	resumeOutcome?: () => ResumeOutcome | undefined;
};

export function interactiveRespawnPlan(
	session: Session,
	resumes: boolean,
): RespawnPlan | null {
	const { claudeSessionId, cwd, initialPrompt, design, auto } = session;
	if (!resumes) return null;
	if (claudeSessionId && hasTranscriptOnDisk(session))
		return {
			spawn: () =>
				spawnClaude({
					resumeSessionId: claudeSessionId,
					cwd,
					sessionId: session.id,
					design,
					auto,
				}),
			status: "waiting",
		};
	if (initialPrompt) return freshClaudePlan(session, initialPrompt, cwd);
	if (cwd) return freshClaudePlan(session, undefined, cwd);
	return null;
}

function freshClaudePlan(
	session: Session,
	prompt: string | undefined,
	cwd: string | undefined,
): RespawnPlan {
	const claudeSessionId = randomUUID();
	return {
		spawn: () => {
			session.claudeSessionId = claudeSessionId;
			rememberSessionTitle(session);
			return spawnClaude({
				prompt,
				cwd,
				sessionId: session.id,
				claudeSessionId,
				design: session.design,
				auto: session.auto,
			});
		},
		status: prompt ? "running" : "waiting",
	};
}
