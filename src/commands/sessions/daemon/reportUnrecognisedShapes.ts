import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import type { ConversationReader } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

const reported = new WeakMap<Session, Set<string>>();

export function reportUnrecognisedShapes(
	session: Session,
	reader: ConversationReader,
	entries: Record<string, unknown>[],
): void {
	const shapes = reader.unrecognised?.(entries) ?? [];
	if (shapes.length === 0) return;
	const seen = reported.get(session) ?? new Set<string>();
	reported.set(session, seen);
	const harness = harnessAdapter(session.harness).kind;
	for (const shape of shapes) {
		if (seen.has(shape)) continue;
		seen.add(shape);
		daemonLog(
			`transcript ${session.id}: unrecognised ${harness} entry shape ${shape} (logged once per session)`,
		);
	}
}
