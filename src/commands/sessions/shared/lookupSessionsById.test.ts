import { beforeEach, describe, expect, it, vi } from "vitest";
import { lookupSessionsById } from "./lookupSessionsById";

const { discoverSessionJsonlPaths, discoverCodexRolloutPaths } = vi.hoisted(
	() => ({
		discoverSessionJsonlPaths: vi.fn(),
		discoverCodexRolloutPaths: vi.fn(),
	}),
);

vi.mock("./discoverSessions", () => ({ discoverSessionJsonlPaths }));
vi.mock("./codex/discoverCodexRolloutPaths", () => ({
	discoverCodexRolloutPaths,
}));
vi.mock("./parseSessionFile", () => ({
	parseSessionFile: (filePath: string, origin: string) => ({
		sessionId: "inner-id",
		name: filePath,
		cwd: "/home/dev/claude-repo",
		origin,
	}),
}));
vi.mock("./codex/parseCodexSessionFile", () => ({
	parseCodexSessionFile: (filePath: string) => ({
		sessionId: "inner-id",
		name: filePath,
		cwd: "/home/dev/codex-repo",
		harness: "codex",
	}),
}));

const CLAUDE_ID = "991a1fde-669f-43f0-9b30-60892465b411";
const CODEX_ID = "019f163e-58d3-7fe0-a671-460fc0aeea4d";

beforeEach(() => {
	discoverSessionJsonlPaths.mockResolvedValue([
		{
			path: `/home/dev/.claude/projects/-repo/${CLAUDE_ID}.jsonl`,
			origin: "wsl",
		},
		{ path: "/home/dev/.claude/projects/-repo/other.jsonl", origin: "wsl" },
	]);
	discoverCodexRolloutPaths.mockResolvedValue([
		`/home/dev/.codex/sessions/2026/06/30/rollout-2026-06-30T11-56-52-${CODEX_ID}.jsonl`,
	]);
});

describe("lookupSessionsById", () => {
	it("reads nothing when no ids are asked for", async () => {
		expect(await lookupSessionsById([])).toEqual(new Map());
		expect(discoverSessionJsonlPaths).not.toHaveBeenCalled();
	});

	it("matches Claude ids on the transcript filename", async () => {
		const found = await lookupSessionsById([CLAUDE_ID]);

		expect(found.get(CLAUDE_ID)?.cwd).toBe("/home/dev/claude-repo");
		expect(found.size).toBe(1);
	});

	it("matches codex ids on the rollout filename suffix", async () => {
		const found = await lookupSessionsById([CODEX_ID]);

		expect(found.get(CODEX_ID)).toMatchObject({
			cwd: "/home/dev/codex-repo",
			harness: "codex",
		});
	});

	it("omits ids with no transcript under either root", async () => {
		expect(await lookupSessionsById(["missing-id"])).toEqual(new Map());
	});
});
