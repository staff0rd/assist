import * as fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { discoverSessionJsonlPaths } from "../shared/discoverSessions";
import { parseSessionFile } from "../shared/parseSessionFile";
import { discoverClaudeSessionId } from "./discoverClaudeSessionId";

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

describe("discoverClaudeSessionId", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the sessionId of a new file matching the cwd", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		parseMock.mockResolvedValue({ sessionId: "abc-123", cwd: "/repo" });

		const result = await discoverClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: () => true,
			pollMs: 1,
		});

		expect(result).toBe("abc-123");
	});

	it("ignores files created before the session started", async () => {
		pathsMock.mockResolvedValue(["/projects/a/old.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 500, mtimeMs: 500 });

		const result = await discoverClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: activeFor(2),
			pollMs: 1,
		});

		expect(result).toBeNull();
		expect(parseMock).not.toHaveBeenCalled();
	});

	it("skips sessionIds already claimed by other sessions", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		parseMock.mockResolvedValue({ sessionId: "claimed", cwd: "/repo" });

		const result = await discoverClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: (id) => id === "claimed",
			isActive: activeFor(2),
			pollMs: 1,
		});

		expect(result).toBeNull();
	});

	it("ignores sessions from other working directories", async () => {
		pathsMock.mockResolvedValue(["/projects/a/new.jsonl"]);
		statMock.mockResolvedValue({ birthtimeMs: 2_000, mtimeMs: 2_000 });
		parseMock.mockResolvedValue({ sessionId: "abc-123", cwd: "/other" });

		const result = await discoverClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: activeFor(2),
			pollMs: 1,
		});

		expect(result).toBeNull();
	});

	it("stops polling once the session is no longer active", async () => {
		const result = await discoverClaudeSessionId({
			cwd: "/repo",
			sinceMs: 1_000,
			isClaimed: () => false,
			isActive: () => false,
			pollMs: 1,
		});

		expect(result).toBeNull();
		expect(pathsMock).not.toHaveBeenCalled();
	});
});
