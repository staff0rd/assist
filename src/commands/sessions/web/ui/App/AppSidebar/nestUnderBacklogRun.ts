import { launcherBySession } from "./nestUnderBacklogRun/launcherBySession";
import type { SessionInfo } from "../../types";

export type NestedSessionRow = {
	session: SessionInfo;
	children: SessionInfo[];
};

export function nestUnderBacklogRun(
	sessions: SessionInfo[],
): NestedSessionRow[] {
	const launcherOf = launcherBySession(sessions);
	const rootOf = new Map<SessionInfo, SessionInfo>();
	for (const session of sessions) {
		const root = rootFor(session, launcherOf);
		if (root) rootOf.set(session, root);
	}

	const rowOf = new Map<SessionInfo, NestedSessionRow>();
	const rows: NestedSessionRow[] = [];
	for (const session of sessions) {
		if (rootOf.has(session)) continue;
		const row: NestedSessionRow = { session, children: [] };
		rowOf.set(session, row);
		rows.push(row);
	}
	for (const session of sessions) {
		const root = rootOf.get(session);
		if (root) rowOf.get(root)?.children.push(session);
	}
	return rows;
}

function rootFor(
	session: SessionInfo,
	launcherOf: Map<SessionInfo, SessionInfo>,
): SessionInfo | undefined {
	const seen = new Set([session]);
	let current = launcherOf.get(session);
	while (current) {
		if (seen.has(current)) return undefined;
		const next = launcherOf.get(current);
		if (!next) return current;
		seen.add(current);
		current = next;
	}
	return undefined;
}
