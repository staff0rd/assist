import type { SessionInfo } from "../daemon/createSession";
import type { SessionRow } from "./SessionRow";

const LOCAL_NODE = "local";

function sessionKind(session: SessionInfo): SessionRow["kind"] {
	if (session.server) return "server";
	return session.commandType === "run" ? "run" : "agent";
}

function repoName(origin: string | undefined): string | undefined {
	return origin
		?.replace(/\.git$/, "")
		.split(/[/:]/)
		.filter(Boolean)
		.pop();
}

type RowLookups = {
	agentNames: Map<string, string>;
	branchOf: (cwd: string) => string | undefined;
};

export function toSessionRow(
	session: SessionInfo,
	{ agentNames, branchOf }: RowLookups,
): SessionRow {
	const local = !session.node;
	const harnessId = session.claudeSessionId ?? session.harnessSessionId;
	return {
		id: session.id,
		kind: sessionKind(session),
		status: session.status,
		node: session.node ?? LOCAL_NODE,
		repo: repoName(session.repoGroup?.origin),
		branch: local && session.cwd ? branchOf(session.cwd) : undefined,
		title: session.title ?? session.generatedTitle ?? session.name,
		agentName: local && harnessId ? agentNames.get(harnessId) : undefined,
	};
}
