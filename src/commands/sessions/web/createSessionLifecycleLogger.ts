import { isWindowsSessionId } from "../daemon/toWindowsSessionId";
import { repoLabel } from "./ui/repoLabel";

type SessionSnapshot = {
	id: string;
	name?: string;
	status?: string;
	cwd?: string;
	activity?: { itemId?: number; phase?: number; totalPhases?: number };
};

// Derives session start/end events from the daemon's `sessions` broadcast lines
// and prints them to the web server's stdout — the process the user actually
// runs. Covers both WSL-local and Windows sessions (the daemon merges both into
// one list). The returned tracer closes over its own live-session map; the web
// server holds a single instance so each session is logged once across all tabs.
export function createSessionLifecycleLogger(): (line: string) => void {
	const known = new Map<string, SessionSnapshot>();
	return (line) => {
		const sessions = parseSnapshot(line);
		if (sessions) applySnapshot(known, sessions);
	};
}

function parseSnapshot(line: string): SessionSnapshot[] | null {
	try {
		const data = JSON.parse(line);
		if (data.type === "sessions" && Array.isArray(data.sessions))
			return data.sessions;
	} catch {}
	return null;
}

function applySnapshot(
	known: Map<string, SessionSnapshot>,
	sessions: SessionSnapshot[],
): void {
	const present = new Set<string>();
	for (const session of sessions) {
		present.add(session.id);
		const previous = known.get(session.id);
		// retain the full snapshot so the "ended" event still has repo/backlog metadata
		known.set(session.id, session);
		if (previous === undefined) logEvent("started", session);
		else if (isDone(session) && !isDone(previous)) logEvent("ended", session);
	}
	for (const [id, session] of known) {
		if (present.has(id)) continue;
		known.delete(id);
		// A "done" session already logged its end; removal is just cleanup.
		if (!isDone(session)) logEvent("ended", session);
	}
}

function isDone(session: SessionSnapshot): boolean {
	return session.status === "done";
}

function logEvent(event: "started" | "ended", session: SessionSnapshot): void {
	const origin = isWindowsSessionId(session.id) ? "windows" : "wsl";
	console.log(
		`${new Date().toISOString()} session ${event}: ${session.id}${describe(session)} [${origin} daemon]`,
	);
}

function describe(session: SessionSnapshot): string {
	const parts: string[] = [];
	const repo = repoLabel(session.cwd);
	if (repo) parts.push(repo);
	const { itemId, phase, totalPhases } = session.activity ?? {};
	if (itemId !== undefined) parts.push(`#${itemId}`);
	if (phase !== undefined)
		parts.push(`phase ${phase}${totalPhases ? `/${totalPhases}` : ""}`);
	return parts.length ? ` ${parts.join(" ")}` : "";
}
