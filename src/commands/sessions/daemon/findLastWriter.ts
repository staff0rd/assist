import { conversationOf } from "../shared/conversationOf";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { daemonLog } from "./daemonLog";
import { isLiveAgent } from "./findServerParents";
import { lastWriteTimes, type WriteTarget } from "./lastWriteTimes";
import { resolveTranscriptPath } from "./resolveTranscriptPath";
import type { Session } from "./types";

type Candidate = { id: string; file?: number; within?: number };

function newest(
	candidates: Candidate[],
	key: "file" | "within",
): Candidate | undefined {
	return candidates
		.filter((c) => c[key] !== undefined)
		.sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))[0];
}

async function sessionWrites(
	session: Session,
	target: WriteTarget,
): Promise<Candidate> {
	const reader = conversationOf(session)?.reader;
	const transcript = reader ? await resolveTranscriptPath(session) : null;
	if (!reader || !transcript) return { id: session.id };
	const entries = await readTranscriptTail(
		transcript,
		Number.POSITIVE_INFINITY,
	);
	return {
		id: session.id,
		...lastWriteTimes(reader.events(entries), target, session.cwd),
	};
}

export async function findLastWriter(
	sessions: Iterable<Session>,
	target: WriteTarget,
): Promise<string | undefined> {
	const live = [...sessions].filter(isLiveAgent);
	const candidates = await Promise.all(
		live.map((session) => sessionWrites(session, target)),
	);
	const writer = newest(candidates, "file") ?? newest(candidates, "within");
	daemonLog(
		`last writer of ${target.file} (within ${target.within}): ${writer ? `session ${writer.id}` : "none"} of ${live.length} live session(s)`,
	);
	return writer?.id;
}
