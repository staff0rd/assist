import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { committedPaths } from "./committedPaths";
import { itemCommitSources } from "./itemCommitSources";
import { transcriptCommits } from "./transcriptCommits";

vi.mock("./itemCommitSources", () => ({ itemCommitSources: vi.fn() }));
vi.mock("./transcriptCommits", () => ({ transcriptCommits: vi.fn() }));
vi.mock("./resolveCommitCached", () => ({
	resolveCommitCached: vi.fn(async () => ({
		base: "base",
		paths: ["a.ts"],
		pathsListed: true,
	})),
}));

const itemCommitSourcesMock = vi.mocked(itemCommitSources);
const transcriptCommitsMock = vi.mocked(transcriptCommits);

describe("committedPaths", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		transcriptCommitsMock.mockResolvedValue([]);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("starts a fresh lookup once a hung one times out", async () => {
		const session = { conversationId: "hung", harness: "claude-sdk" as const };
		itemCommitSourcesMock.mockReturnValueOnce(new Promise(() => {}));
		const hung = expect(committedPaths("/repo", session)).rejects.toThrow(
			"timed out",
		);
		await vi.advanceTimersByTimeAsync(10_000);
		await hung;

		itemCommitSourcesMock.mockResolvedValueOnce({
			commits: [{ sha: "one" }],
			conversationIds: [],
		});
		const { commits, bases } = await committedPaths("/repo", session);

		expect(commits).toEqual([{ sha: "one" }]);
		expect(bases).toEqual(new Map([["a.ts", "base"]]));
	});
});
