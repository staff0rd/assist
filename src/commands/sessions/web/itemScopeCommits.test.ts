import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { itemCommits } from "./itemCommits";
import { itemScopeCommits } from "./itemScopeCommits";

vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));
vi.mock("./itemCommits", () => ({ itemCommits: vi.fn(async () => []) }));

const loadConfigFromMock = vi.mocked(loadConfigFrom);
const itemCommitsMock = vi.mocked(itemCommits);

function config(includeCommittedChanges?: boolean): void {
	loadConfigFromMock.mockReturnValue({
		sessions:
			includeCommittedChanges === undefined ? {} : { includeCommittedChanges },
	} as unknown as ReturnType<typeof loadConfigFrom>);
}

describe("itemScopeCommits", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists the item's recorded commits", async () => {
		config(true);
		itemCommitsMock.mockResolvedValue([{ sha: "one", title: "feat: one" }]);

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([
			{ sha: "one", title: "feat: one" },
		]);
	});

	it("lists nothing when the flag is off", async () => {
		config(false);

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([]);
		expect(itemCommitsMock).not.toHaveBeenCalled();
	});

	it("lists the item's commits when the flag is unset", async () => {
		config();
		itemCommitsMock.mockResolvedValue([{ sha: "one" }]);

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([{ sha: "one" }]);
	});

	it("lists the item's commits when the config cannot be loaded", async () => {
		loadConfigFromMock.mockImplementation(() => {
			throw new Error("bad yaml");
		});
		itemCommitsMock.mockResolvedValue([{ sha: "one" }]);

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([{ sha: "one" }]);
	});

	it("lists nothing without a session", async () => {
		config(true);

		expect(await itemScopeCommits("/repo")).toEqual([]);
		expect(itemCommitsMock).not.toHaveBeenCalled();
	});
});
