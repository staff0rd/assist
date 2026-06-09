import * as fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { discoverSessionJsonlPaths } from "../shared/discoverSessions";
import { parseSessionFile } from "../shared/parseSessionFile";
import { watchClaudeSessionId } from "./watchClaudeSessionId";

vi.mock("node:fs", () => ({ promises: { stat: vi.fn() } }));
vi.mock("../shared/discoverSessions", () => ({
	discoverSessionJsonlPaths: vi.fn(),
}));
vi.mock("../shared/parseSessionFile", () => ({ parseSessionFile: vi.fn() }));

const statMock = fs.promises.stat as unknown as ReturnType<typeof vi.fn>;
const pathsMock = discoverSessionJsonlPaths as unknown as ReturnType<
	typeof vi.fn
>;
const parseMock = parseSessionFile as unknown as ReturnType<typeof vi.fn>;

function activeFor(iterations: number): () => boolean {
	let calls = 0;
	return () => calls++ < iterations;
}

describe("watchClaudeSessionId", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reports the sessionId of a new file matching the cwd", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		parseMock.mockResolvedValue({ sessionId: "abc-123", cwd: "/repo" });
		const onSessionId = vi.fn();

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: activeFor(1),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).toHaveBeenCalledExactlyOnceWith("abc-123");
	});

	it("ignores files created before the session started", async () => {
		pathsMock.mockResolvedValue(["/projects/a/old.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 500, mtimeMs: 500 });
		const onSessionId = vi.fn();

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: activeFor(1),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).not.toHaveBeenCalled();
		expect(parseMock).not.toHaveBeenCalled();
	});

	it("skips sessionIds already claimed by other sessions", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		parseMock.mockResolvedValue({ sessionId: "claimed", cwd: "/repo" });
		const onSessionId = vi.fn();

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: (id) => id === "claimed",
			isActive: activeFor(1),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).not.toHaveBeenCalled();
	});

	it("ignores sessions from other working directories", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		parseMock.mockResolvedValue({ sessionId: "abc-123", cwd: "/other" });
		const onSessionId = vi.fn();

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: activeFor(1),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).not.toHaveBeenCalled();
	});

	it("stops polling once the session is no longer active", async () => {
		const onSessionId = vi.fn();

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: () => false,
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).not.toHaveBeenCalled();
		expect(pathsMock).not.toHaveBeenCalled();
	});

	it("adopts the newest matching transcript, not the first discovered", async () => {
		pathsMock.mockResolvedValue([
			"/projects/a/phase1.jsonl",
			"/projects/a/phase2.jsonl",
		]);
		statMock.mockImplementation((p: string) =>
			Promise.resolve(
				p.includes("phase2")
					? { birthtimeMs: 3_000, mtimeMs: 3_000 }
					: { birthtimeMs: 2_000, mtimeMs: 2_000 },
			),
		);
		parseMock.mockImplementation((p: string) =>
			Promise.resolve(
				p.includes("phase2")
					? { sessionId: "phase-2", cwd: "/repo" }
					: { sessionId: "phase-1", cwd: "/repo" },
			),
		);
		const onSessionId = vi.fn();

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: activeFor(1),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).toHaveBeenCalledExactlyOnceWith("phase-2");
	});

	it("follows the card to a newer session when its work moves on", async () => {
		const claimed = new Set<string>();
		statMock.mockImplementation((p: string) =>
			Promise.resolve(
				p.includes("phase2")
					? { birthtimeMs: 3_000, mtimeMs: 3_000 }
					: { birthtimeMs: 2_000, mtimeMs: 2_000 },
			),
		);
		parseMock.mockImplementation((p: string) =>
			Promise.resolve(
				p.includes("phase2")
					? { sessionId: "phase-2", cwd: "/repo" }
					: { sessionId: "phase-1", cwd: "/repo" },
			),
		);
		pathsMock
			.mockResolvedValueOnce(["/projects/a/phase1.jsonl"])
			.mockResolvedValue([
				"/projects/a/phase1.jsonl",
				"/projects/a/phase2.jsonl",
			]);
		const onSessionId = vi.fn((id: string) => claimed.add(id));

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: (id) => claimed.has(id),
			isActive: activeFor(2),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).toHaveBeenNthCalledWith(1, "phase-1");
		expect(onSessionId).toHaveBeenNthCalledWith(2, "phase-2");
	});

	it("does not re-report the same session on subsequent polls", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		const claimed = new Set<string>();
		parseMock.mockImplementation(() =>
			Promise.resolve({ sessionId: "abc-123", cwd: "/repo" }),
		);
		const onSessionId = vi.fn((id: string) => claimed.add(id));

		await watchClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: (id) => claimed.has(id),
			isActive: activeFor(3),
			onSessionId,
			pollMs: 1,
		});

		expect(onSessionId).toHaveBeenCalledExactlyOnceWith("abc-123");
	});
});
