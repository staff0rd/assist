import type { SessionInfo } from "../../types";

export function launcherBySession(
	sessions: SessionInfo[],
): Map<SessionInfo, SessionInfo> {
	const byId = new Map(
		sessions.map((session) => [nodeKey(session, session.id), session]),
	);
	const runByTree = firstBacklogRunPerTree(sessions);
	const launcherOf = new Map<SessionInfo, SessionInfo>();
	for (const session of sessions) {
		const launcher =
			launchingCard(session, byId) ?? runSharingTree(session, runByTree);
		if (launcher) launcherOf.set(session, launcher);
	}
	return launcherOf;
}

function firstBacklogRunPerTree(
	sessions: SessionInfo[],
): Map<string, SessionInfo> {
	const runByTree = new Map<string, SessionInfo>();
	for (const session of sessions) {
		const tree = nestableTree(session);
		if (!tree || !isBacklogRun(session) || runByTree.has(tree)) continue;
		runByTree.set(tree, session);
	}
	return runByTree;
}

function launchingCard(
	session: SessionInfo,
	byId: Map<string, SessionInfo>,
): SessionInfo | undefined {
	const launcher = session.launchedFrom
		? byId.get(nodeKey(session, session.launchedFrom))
		: undefined;
	if (!launcher || launcher === session) return undefined;
	return sharesPath(session, launcher) ? launcher : undefined;
}

function sharesPath(session: SessionInfo, launcher: SessionInfo): boolean {
	return (
		session.cwd !== undefined &&
		session.cwd === launcher.cwd &&
		session.node === launcher.node
	);
}

function runSharingTree(
	session: SessionInfo,
	runByTree: Map<string, SessionInfo>,
): SessionInfo | undefined {
	if (isBacklogRun(session)) return undefined;
	const tree = nestableTree(session);
	const run = tree ? runByTree.get(tree) : undefined;
	return run === session ? undefined : run;
}

function isBacklogRun(session: SessionInfo): boolean {
	return session.activity?.kind === "backlog";
}

function nestableTree(session: SessionInfo): string | undefined {
	const { cwd, repoGroup } = session;
	if (!cwd || !repoGroup || repoGroup.clone === cwd) return undefined;
	return nodeKey(session, cwd);
}

function nodeKey(session: SessionInfo, value: string): string {
	return JSON.stringify([session.node ?? null, value]);
}
