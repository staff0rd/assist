import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CommitRef } from "../../../shared/db/listCommitRefs";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { committedPaths } from "./committedPaths";
import { itemScopeCommits } from "./itemScopeCommits";

vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));
vi.mock("./committedPaths", () => ({ committedPaths: vi.fn() }));

const loadConfigFromMock = vi.mocked(loadConfigFrom);
const committedPathsMock = vi.mocked(committedPaths);

function config(includeCommittedChanges?: boolean): void {
	loadConfigFromMock.mockReturnValue({
		sessions:
			includeCommittedChanges === undefined ? {} : { includeCommittedChanges },
	} as unknown as ReturnType<typeof loadConfigFrom>);
}

function commits(refs: CommitRef[]): void {
	committedPathsMock.mockResolvedValue({ commits: refs, bases: new Map() });
}

describe("itemScopeCommits", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		commits([]);
	});

	it("lists the session's committed changes", async () => {
		config(true);
		commits([{ sha: "one", title: "feat: one" }]);

		expect(
			await itemScopeCommits("/repo", { conversationId: "sess-1" }),
		).toEqual([{ sha: "one", title: "feat: one" }]);
		expect(committedPathsMock).toHaveBeenCalledWith("/repo", {
			conversationId: "sess-1",
		});
	});

	it("lists commits found without a backlog item, such as from the transcript", async () => {
		config(true);
		commits([{ sha: "f16e93bc" }]);

		expect(
			await itemScopeCommits("/repo", {
				conversationId: "review-sess",
				harness: "codex",
			}),
		).toEqual([{ sha: "f16e93bc" }]);
	});

	it("lists nothing when the flag is off", async () => {
		config(false);

		expect(
			await itemScopeCommits("/repo", { conversationId: "sess-1" }),
		).toEqual([]);
		expect(committedPathsMock).not.toHaveBeenCalled();
	});

	it("lists the commits when the flag is unset", async () => {
		config();
		commits([{ sha: "one" }]);

		expect(
			await itemScopeCommits("/repo", { conversationId: "sess-1" }),
		).toEqual([{ sha: "one" }]);
	});

	it("lists the commits when the config cannot be loaded", async () => {
		loadConfigFromMock.mockImplementation(() => {
			throw new Error("bad yaml");
		});
		commits([{ sha: "one" }]);

		expect(
			await itemScopeCommits("/repo", { conversationId: "sess-1" }),
		).toEqual([{ sha: "one" }]);
	});

	it("lists nothing without a session", async () => {
		config(true);

		expect(await itemScopeCommits("/repo")).toEqual([]);
		expect(committedPathsMock).not.toHaveBeenCalled();
	});
});
