import { beforeEach, describe, expect, it, vi } from "vitest";
import { originResolutionForCwd } from "./originForCwd";
import { repoDirExists } from "./repoDirExists";
import { repoGroupForCwd } from "./repoGroupForCwd";
import { mainWorktree } from "./worktree/listWorktreePaths";
import { worktreeAttributionIncludingReaped } from "./worktree/readWorktreeRegistry";

vi.mock("./originForCwd", () => ({ originResolutionForCwd: vi.fn() }));
vi.mock("./repoDirExists", () => ({ repoDirExists: vi.fn() }));
vi.mock("./worktree/listWorktreePaths", () => ({ mainWorktree: vi.fn() }));
vi.mock("./worktree/readWorktreeRegistry", () => ({
	worktreeAttributionIncludingReaped: vi.fn(),
}));

const origin = vi.mocked(originResolutionForCwd);
const clone = vi.mocked(mainWorktree);
const attribution = vi.mocked(worktreeAttributionIncludingReaped);
const dirExists = vi.mocked(repoDirExists);

const stable = (value: string) => ({ origin: value, stable: true });

describe("repoGroupForCwd", () => {
	beforeEach(() => {
		origin.mockReset();
		clone.mockReset();
		attribution.mockReset();
		dirExists.mockReset();
		attribution.mockReturnValue(undefined);
		dirExists.mockReturnValue(true);
	});

	it("returns undefined without probing when there is no cwd", () => {
		expect(repoGroupForCwd(undefined)).toBeUndefined();
		expect(clone).not.toHaveBeenCalled();
	});

	it("groups a worktree under its clone's origin", () => {
		clone.mockReturnValue("/git/repo-a");
		origin.mockReturnValue(stable("host/org/repo"));

		expect(repoGroupForCwd("/git/repo-a-2")).toEqual({
			origin: "host/org/repo",
			clone: "/git/repo-a",
		});
		expect(origin).toHaveBeenCalledWith("/git/repo-a");
	});

	it("attributes a reaped worktree from the registry when git can no longer read it", () => {
		clone.mockReturnValue(null);
		attribution.mockReturnValue({
			clone: "/git/repo-b",
			origin: "host/org/repo",
		});

		expect(repoGroupForCwd("/git/repo-b-3")).toEqual({
			origin: "host/org/repo",
			clone: "/git/repo-b",
		});
	});

	it("reconciles a stale registry origin against the clone's current origin", () => {
		clone.mockImplementation((cwd) => (cwd === "/git/repo-f" ? cwd : null));
		origin.mockReturnValue(stable("host/org/repo-f"));
		attribution.mockReturnValue({
			clone: "/git/repo-f",
			origin: "local:/git/repo-f",
		});

		expect(repoGroupForCwd("/git/repo-f-2")).toEqual({
			origin: "host/org/repo-f",
			clone: "/git/repo-f",
		});
	});

	it("returns undefined for a path that is neither a repo nor a known worktree", () => {
		clone.mockReturnValue(null);

		expect(repoGroupForCwd("/tmp/scratch-c")).toBeUndefined();
	});

	it("keeps the plain origin for a Windows checkout", () => {
		clone.mockReturnValue(String.raw`C:\git\repo-g`);
		origin.mockReturnValue(stable("host/org/repo"));

		expect(repoGroupForCwd(String.raw`C:\git\repo-g`)).toEqual({
			origin: "host/org/repo",
			clone: String.raw`C:\git\repo-g`,
		});
	});

	it("memoises per cwd so git is only shelled once", () => {
		clone.mockReturnValue("/git/repo-e");
		origin.mockReturnValue(stable("host/org/repo"));

		repoGroupForCwd("/git/repo-e");
		repoGroupForCwd("/git/repo-e");

		expect(clone).toHaveBeenCalledTimes(1);
	});

	it("re-resolves a worktree whose clone origin came from a failed remote lookup", () => {
		clone.mockReturnValue("/git/repo-g");
		origin.mockReturnValueOnce({ origin: "local:/git/repo-g", stable: false });

		expect(repoGroupForCwd("/git/repo-g-2")).toEqual({
			origin: "local:/git/repo-g",
			clone: "/git/repo-g",
		});

		origin.mockReturnValueOnce(stable("host/org/repo-g"));

		expect(repoGroupForCwd("/git/repo-g-2")).toEqual({
			origin: "host/org/repo-g",
			clone: "/git/repo-g",
		});
	});

	it("re-resolves a reaped worktree attributed from the recorded origin alone", () => {
		clone.mockReturnValueOnce(null).mockReturnValueOnce(null);
		attribution.mockReturnValue({
			clone: "/git/repo-h",
			origin: "local:/git/repo-h",
		});

		expect(repoGroupForCwd("/git/repo-h-2")).toEqual({
			origin: "local:/git/repo-h",
			clone: "/git/repo-h",
		});

		clone.mockReturnValue("/git/repo-h");
		origin.mockReturnValue(stable("host/org/repo-h"));

		expect(repoGroupForCwd("/git/repo-h-2")).toEqual({
			origin: "host/org/repo-h",
			clone: "/git/repo-h",
		});
	});

	it("re-probes a cwd that did not exist yet, so a seeding worktree still joins its clone", () => {
		clone.mockReturnValueOnce(null);
		dirExists.mockReturnValueOnce(false);

		expect(repoGroupForCwd("/git/repo-i-2")).toBeUndefined();

		clone.mockReturnValue("/git/repo-i");
		origin.mockReturnValue(stable("host/org/repo-i"));

		expect(repoGroupForCwd("/git/repo-i-2")).toEqual({
			origin: "host/org/repo-i",
			clone: "/git/repo-i",
		});
	});
});
