import { readAgentNames } from "../list/readAgentNames";
import type { Session } from "./types";

export type SessionSender = { id: string; agent?: string };

export function sessionSender(
	sessions: Map<string, Session>,
	id: string,
	agentNames: () => Map<string, string> = readAgentNames,
): SessionSender | undefined {
	const session = sessions.get(id);
	if (!session) return undefined;
	const harnessId = session.claudeSessionId ?? session.harnessSessionId;
	const agent = harnessId ? agentNames().get(harnessId) : undefined;
	return agent ? { id, agent } : { id };
}
