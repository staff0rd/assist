import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { preassignedId } from "../../../shared/harnessAdapters/preassignedId";
import { resolveCapability } from "../../../shared/harnessAdapters/resolveCapability";
import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import type { ResumeOutcome } from "./conversationResumeOutcome";
import type { Session } from "./createSession";
import { rememberSessionTitle } from "./rememberSessionTitle";

export type RespawnPlan = {
	spawn: () => Session["pty"];
	status: Session["status"];
	resumeOutcome?: () => ResumeOutcome | undefined;
};

export function interactiveRespawnPlan(session: Session): RespawnPlan | null {
	const adapter = harnessAdapter(session.harness);
	if (!resolveCapability(adapter.capabilities, "conversation.resume").supported)
		return null;
	const { cwd, initialPrompt, design, auto } = session;
	const resumeId = adapter.conversation.findResumable(session);
	if (resumeId)
		return {
			spawn: () =>
				adapter.interactive({
					resumeId,
					cwd,
					sessionId: session.id,
					design,
					auto,
				}),
			status: "waiting",
		};
	if (!initialPrompt && !cwd) return null;
	return freshPlan(session, adapter, initialPrompt);
}

function freshPlan(
	session: Session,
	adapter: HarnessAdapter,
	prompt: string | undefined,
): RespawnPlan {
	const conversationId = preassignedId(adapter);
	return {
		spawn: () => {
			session.claudeSessionId = undefined;
			session.harnessSessionId = undefined;
			Object.assign(session, adapter.activityIdentity(conversationId));
			rememberSessionTitle(session);
			return adapter.interactive({
				prompt,
				cwd: session.cwd,
				sessionId: session.id,
				conversationId,
				design: session.design,
				auto: session.auto,
			});
		},
		status: prompt ? "running" : "waiting",
	};
}
