import { describe, expect, it, vi } from "vitest";
import type { HistoricalSession } from "../shared/parseSessionFile";
import { collectHistory } from "./collectHistory";

function session(
	sessionId: string,
	timestamp: string,
	lastActivity?: string,
	node?: string,
): HistoricalSession {
	return {
		sessionId,
		name: sessionId,
		project: "assist",
		cwd: "/repo",
		timestamp,
		...(lastActivity && { lastActivity }),
		origin: "wsl",
		...(node && { node }),
	};
}

vi.mock("../shared/discoverSessions", () => ({
	discoverSessions: async () => [
		session("local-old", "2026-08-09T09:00:00Z", "2026-08-09T10:00:00Z"),
		session("local-new", "2026-08-09T11:00:00Z", "2026-08-09T12:00:00Z"),
	],
}));
vi.mock("./withRepoGroups", () => ({
	withRepoGroups: <T>(sessions: T[]) => sessions,
}));

describe("collectHistory", () => {
	it("merges linked sessions among local ones by last activity", async () => {
		const history = await collectHistory([
			session(
				"peer-closed",
				"2026-08-09T08:00:00Z",
				"2026-08-09T13:00:00Z",
				"pc",
			),
			session("peer-legacy", "2026-08-09T11:30:00Z", undefined, "pc"),
		]);

		expect(history.map((s) => s.sessionId)).toEqual([
			"peer-closed",
			"local-new",
			"peer-legacy",
			"local-old",
		]);
	});
});
