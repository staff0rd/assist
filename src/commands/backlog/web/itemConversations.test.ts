import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HistoricalSession } from "../../sessions/shared/parseSessionFile";
import type { BacklogItem } from "../types";
import { itemConversations } from "./itemConversations";

const lookupSessionsById = vi.hoisted(() => vi.fn());

vi.mock("../../sessions/shared/lookupSessionsById", () => ({
	lookupSessionsById,
}));

function item(overrides: Partial<BacklogItem>): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "An item",
		acceptanceCriteria: [],
		status: "todo",
		starred: false,
		...overrides,
	};
}

function transcript(
	overrides: Partial<HistoricalSession> & { sessionId: string },
): HistoricalSession {
	return {
		name: "Transcript name",
		project: "repo",
		cwd: "/home/dev/repo",
		timestamp: "2026-07-01T00:00:00.000Z",
		origin: "wsl",
		...overrides,
	};
}

beforeEach(() => {
	lookupSessionsById.mockReset();
	lookupSessionsById.mockResolvedValue(new Map());
});

describe("itemConversations", () => {
	it("returns nothing when the item has no conversation ids", async () => {
		expect(await itemConversations(item({}))).toEqual([]);
		expect(lookupSessionsById).not.toHaveBeenCalled();
	});

	it("merges session git-refs with phase sessions, deduped and newest first", async () => {
		const conversations = await itemConversations(
			item({
				gitRefs: [
					{
						kind: "session",
						ref: "shared-id",
						title: "Recorded",
						createdAt: "2026-07-02T00:00:00.000Z",
					},
					{ kind: "commit", ref: "abc1234" },
				],
				phaseSessions: [
					{
						phaseIdx: 0,
						claudeSessionId: "shared-id",
						hostname: "box",
						osUser: "dev",
						createdAt: "2026-07-01T00:00:00.000Z",
					},
					{
						phaseIdx: 1,
						claudeSessionId: "phase-only-id",
						hostname: "box",
						osUser: "dev",
						createdAt: "2026-07-03T00:00:00.000Z",
					},
				],
			}),
		);

		expect(conversations).toEqual([
			{ sessionId: "phase-only-id", createdAt: "2026-07-03T00:00:00.000Z" },
			{
				sessionId: "shared-id",
				title: "Recorded",
				createdAt: "2026-07-02T00:00:00.000Z",
			},
		]);
	});

	it("fills cwd and harness from the transcript without overwriting a recorded title", async () => {
		lookupSessionsById.mockResolvedValue(
			new Map([
				[
					"claude-id",
					transcript({ sessionId: "claude-id", cwd: "/home/dev/one" }),
				],
				[
					"codex-id",
					transcript({
						sessionId: "codex-id",
						cwd: "/home/dev/two",
						harness: "codex",
						name: "Codex run",
					}),
				],
			]),
		);

		const conversations = await itemConversations(
			item({
				gitRefs: [
					{
						kind: "session",
						ref: "claude-id",
						title: "Recorded",
						createdAt: "2026-07-05T00:00:00.000Z",
					},
				],
				phaseSessions: [
					{
						phaseIdx: 0,
						claudeSessionId: "codex-id",
						hostname: "box",
						osUser: "dev",
						createdAt: "2026-07-04T00:00:00.000Z",
					},
				],
			}),
		);

		expect(conversations).toEqual([
			{
				sessionId: "claude-id",
				title: "Recorded",
				cwd: "/home/dev/one",
				createdAt: "2026-07-05T00:00:00.000Z",
			},
			{
				sessionId: "codex-id",
				title: "Codex run",
				cwd: "/home/dev/two",
				harness: "codex",
				createdAt: "2026-07-04T00:00:00.000Z",
			},
		]);
	});

	it("keeps an id whose transcript is gone, leaving the cwd unresolved", async () => {
		const conversations = await itemConversations(
			item({
				phaseSessions: [
					{
						phaseIdx: 0,
						claudeSessionId: "vanished-id",
						hostname: "box",
						osUser: "dev",
					},
				],
			}),
		);

		expect(conversations).toEqual([{ sessionId: "vanished-id" }]);
	});
});
