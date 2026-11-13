import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { discoverHistoryEntries } from "./discoverHistoryEntries";
import { saveSessionTitle } from "./loadSessionTitles";

vi.mock("./discoverSessionJsonlPaths", () => ({
	discoverSessionJsonlPaths: async () => [
		{ path: "/p/claude-1.jsonl", origin: "wsl" },
		{ path: "/p/claude-2.jsonl", origin: "wsl" },
	],
}));
vi.mock("./codex/discoverCodexHistoryEntries", () => ({
	discoverCodexHistoryEntries: async () => [
		{
			filePath: "/c/rollout.jsonl",
			session: {
				sessionId: "codex-1",
				name: "codex",
				cwd: "/repo",
				timestamp: new Date(0).toISOString(),
				lastActivity: new Date(2000).toISOString(),
				harness: "codex",
			},
		},
	],
}));
vi.mock("./parseSessionFile", () => ({
	parseSessionFile: async (filePath: string, origin: string) => ({
		sessionId: filePath.replace(/^\/p\/|\.jsonl$/g, ""),
		name: filePath,
		cwd: "/repo",
		timestamp: new Date(filePath.endsWith("1.jsonl") ? 0 : 5000).toISOString(),
		lastActivity: filePath.endsWith("1.jsonl")
			? new Date(9000).toISOString()
			: undefined,
		origin,
	}),
}));

beforeEach(() => {
	vi.stubEnv("ASSIST_STORE_DIR", mkdtempSync(join(tmpdir(), "history-")));
	return () => vi.unstubAllEnvs();
});

describe("discoverHistoryEntries", () => {
	it("carries each session's kept title", async () => {
		saveSessionTitle("claude-1", "Fix the build");
		saveSessionTitle("codex-1", "Tidy docs");

		const titles = Object.fromEntries(
			(await discoverHistoryEntries()).map(({ session }) => [
				session.sessionId,
				session.title,
			]),
		);

		expect(titles).toEqual({
			"claude-1": "Fix the build",
			"claude-2": undefined,
			"codex-1": "Tidy docs",
		});
	});

	it("orders by last activity, falling back to the start timestamp", async () => {
		const ids = (await discoverHistoryEntries()).map(
			({ session }) => session.sessionId,
		);

		expect(ids).toEqual(["claude-1", "claude-2", "codex-1"]);
	});
});
