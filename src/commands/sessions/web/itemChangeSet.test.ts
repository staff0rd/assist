import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { execGit } from "./execGit";
import { itemChangeSet } from "./itemChangeSet";
import { itemCommits } from "./itemCommits";
import { transcriptCommits } from "./transcriptCommits";

vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));
vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./itemCommits", () => ({ itemCommits: vi.fn(async () => []) }));
vi.mock("./transcriptCommits", () => ({
	transcriptCommits: vi.fn(async () => []),
}));

const loadConfigFromMock = vi.mocked(loadConfigFrom);
const execGitMock = vi.mocked(execGit);
const itemCommitsMock = vi.mocked(itemCommits);
const transcriptCommitsMock = vi.mocked(transcriptCommits);

const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

type Repo = Record<string, { parent?: string; paths: string[] }>;

let sessions = 0;
const nextSession = () => ({ conversationId: `sess-${++sessions}` });

function config(includeCommittedChanges?: boolean): void {
	loadConfigFromMock.mockReturnValue({
		sessions:
			includeCommittedChanges === undefined ? {} : { includeCommittedChanges },
	} as unknown as ReturnType<typeof loadConfigFrom>);
}

function withRepo(repo: Repo, dirty: string[] = []): void {
	execGitMock.mockImplementation(async (_cwd, args) => {
		if (args[0] === "cat-file") {
			const sha = String(args[2]).replace("^{commit}", "");
			if (!repo[sha]) throw new Error(`missing object ${sha}`);
			return "";
		}
		if (args[0] === "rev-parse") {
			const parent = repo[String(args[3]).replace(/\^$/, "")]?.parent;
			if (!parent) throw new Error("no parent");
			return `${parent}\n`;
		}
		if (args[0] === "diff-tree")
			return (repo[String(args.at(-1))]?.paths ?? []).join("\n");
		return dirty.join("\n");
	});
}

function commits(...shas: string[]): void {
	itemCommitsMock.mockResolvedValue(shas.map((sha) => ({ sha })));
}

describe("itemChangeSet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("diffs the working tree alone when the flag is off", async () => {
		config(false);
		commits("one");

		expect(await itemChangeSet("/repo", nextSession())).toBeUndefined();
		expect(itemCommitsMock).not.toHaveBeenCalled();
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("includes committed changes when the flag is unset", async () => {
		config();
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups).toEqual([{ base: "base-one", paths: ["a.ts"] }]);
	});

	it("includes committed changes when the config cannot be loaded", async () => {
		loadConfigFromMock.mockImplementation(() => {
			throw new Error("bad yaml");
		});
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups).toEqual([{ base: "base-one", paths: ["a.ts"] }]);
	});

	it("diffs the working tree alone without a session", async () => {
		config(true);

		expect(await itemChangeSet("/repo")).toBeUndefined();
		expect(itemCommitsMock).not.toHaveBeenCalled();
	});

	it("diffs the working tree alone when the item has no recorded commits", async () => {
		config(true);
		commits();
		withRepo({});

		expect(await itemChangeSet("/repo", nextSession())).toBeUndefined();
	});

	it("falls back to the commits in the session's transcript when it has no item", async () => {
		config(true);
		commits();
		transcriptCommitsMock.mockResolvedValueOnce([{ sha: "one" }]);
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
		const session = nextSession();

		const changeSet = await itemChangeSet("/repo", session);

		expect(transcriptCommitsMock).toHaveBeenCalledWith("/repo", session);
		expect(changeSet?.commits).toEqual([{ sha: "one" }]);
		expect(changeSet?.groups).toEqual([{ base: "base-one", paths: ["a.ts"] }]);
	});

	it("prefers the item's commits over the transcript", async () => {
		config(true);
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });

		await itemChangeSet("/repo", nextSession());

		expect(transcriptCommitsMock).not.toHaveBeenCalled();
	});

	it("groups each path under the parent of the earliest commit that touched it", async () => {
		config(true);
		commits("one", "two");
		withRepo({
			one: { parent: "base-one", paths: ["a.ts", "b.ts"] },
			two: { parent: "one", paths: ["b.ts", "c.ts"] },
		});

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups).toEqual([
			{ base: "base-one", paths: ["a.ts", "b.ts"] },
			{ base: "one", paths: ["c.ts"] },
		]);
	});

	it("never lists a path belonging to a commit that is not the item's", async () => {
		config(true);
		commits("one");
		withRepo({
			one: { parent: "base-one", paths: ["a.ts"] },
			release: { parent: "one", paths: ["CHANGELOG.md", "package.json"] },
		});

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups.flatMap((group) => group.paths)).toEqual(["a.ts"]);
	});

	it("skips a recorded commit that is no longer in the repo", async () => {
		config(true);
		commits("gone", "one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups).toEqual([{ base: "base-one", paths: ["a.ts"] }]);
	});

	it("bases a root commit on the empty tree", async () => {
		config(true);
		commits("root");
		withRepo({ root: { paths: ["a.ts"] } });

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups).toEqual([{ base: EMPTY_TREE, paths: ["a.ts"] }]);
	});

	it("adds a HEAD group for paths dirty only in the working tree", async () => {
		config(true);
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } }, [
			"a.ts",
			"z.ts",
			"m.ts",
		]);

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups).toEqual([
			{ base: "base-one", paths: ["a.ts"] },
			{ base: "HEAD", paths: ["m.ts", "z.ts"] },
		]);
	});

	it("omits the HEAD group when the tree is clean", async () => {
		config(true);
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.groups.map((group) => group.base)).toEqual(["base-one"]);
	});

	it("returns the item's commits alongside the groups", async () => {
		config(true);
		itemCommitsMock.mockResolvedValue([{ sha: "one", title: "feat: one" }]);
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });

		const changeSet = await itemChangeSet("/repo", nextSession());

		expect(changeSet?.commits).toEqual([{ sha: "one", title: "feat: one" }]);
	});

	it("caches the commit lookup instead of querying on every poll", async () => {
		config(true);
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
		const session = nextSession();

		await itemChangeSet("/repo", session);
		await itemChangeSet("/repo", session);

		expect(itemCommitsMock).toHaveBeenCalledOnce();
	});

	it("shares one in-flight lookup between concurrent polls", async () => {
		config(true);
		commits("one");
		withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
		const session = nextSession();

		await Promise.all([
			itemChangeSet("/repo", session),
			itemChangeSet("/repo", session),
		]);

		expect(itemCommitsMock).toHaveBeenCalledOnce();
	});

	describe("once the commit lookup cache expires", () => {
		const gitCallsFor = (sha: string) =>
			execGitMock.mock.calls.filter(([, args]) =>
				args.some((arg) => arg.startsWith(sha)),
			).length;

		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("does not resolve an already resolved commit again", async () => {
			config(true);
			commits("one");
			withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
			const session = nextSession();

			await itemChangeSet("/repo", session);
			const resolvingOnce = gitCallsFor("one");
			vi.advanceTimersByTime(60_000);
			const changeSet = await itemChangeSet("/repo", session);

			expect(itemCommitsMock).toHaveBeenCalledTimes(2);
			expect(gitCallsFor("one")).toBe(resolvingOnce);
			expect(changeSet?.groups).toEqual([
				{ base: "base-one", paths: ["a.ts"] },
			]);
		});

		it("resolves a commit recorded since the last lookup", async () => {
			config(true);
			commits("one");
			withRepo({
				one: { parent: "base-one", paths: ["a.ts"] },
				two: { parent: "one", paths: ["b.ts"] },
			});
			const session = nextSession();

			await itemChangeSet("/repo", session);
			commits("one", "two");
			vi.advanceTimersByTime(60_000);
			const changeSet = await itemChangeSet("/repo", session);

			expect(changeSet?.groups).toEqual([
				{ base: "base-one", paths: ["a.ts"] },
				{ base: "one", paths: ["b.ts"] },
			]);
		});

		it("retries a commit that was missing from the repo", async () => {
			config(true);
			commits("one");
			withRepo({});
			const session = nextSession();

			expect(await itemChangeSet("/repo", session)).toBeUndefined();
			withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
			vi.advanceTimersByTime(60_000);
			const changeSet = await itemChangeSet("/repo", session);

			expect(changeSet?.groups).toEqual([
				{ base: "base-one", paths: ["a.ts"] },
			]);
		});

		it("retries a commit whose paths could not be listed", async () => {
			config(true);
			commits("one");
			withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
			const listing = execGitMock.getMockImplementation();
			execGitMock.mockImplementation(async (cwd, args) => {
				if (args[0] === "diff-tree") throw new Error("diff-tree failed");
				return listing?.(cwd, args) ?? "";
			});
			const session = nextSession();

			expect(await itemChangeSet("/repo", session)).toBeUndefined();
			withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
			vi.advanceTimersByTime(60_000);
			const changeSet = await itemChangeSet("/repo", session);

			expect(changeSet?.groups).toEqual([
				{ base: "base-one", paths: ["a.ts"] },
			]);
		});

		it("does not resolve a commit that changed no paths again", async () => {
			config(true);
			commits("merge", "one");
			withRepo({
				merge: { parent: "base-merge", paths: [] },
				one: { parent: "base-one", paths: ["a.ts"] },
			});
			const session = nextSession();

			await itemChangeSet("/repo", session);
			const resolvingOnce = gitCallsFor("merge");
			vi.advanceTimersByTime(60_000);
			await itemChangeSet("/repo", session);

			expect(gitCallsFor("merge")).toBe(resolvingOnce);
		});

		it("drops a resolved commit that a history rewrite later removed", async () => {
			config(true);
			commits("one", "two");
			withRepo({
				one: { parent: "base-one", paths: ["a.ts"] },
				two: { parent: "one", paths: ["b.ts"] },
			});
			const session = nextSession();

			await itemChangeSet("/repo", session);
			withRepo({ one: { parent: "base-one", paths: ["a.ts"] } });
			vi.advanceTimersByTime(11 * 60_000);
			const changeSet = await itemChangeSet("/repo", session);

			expect(changeSet?.groups).toEqual([
				{ base: "base-one", paths: ["a.ts"] },
			]);
		});
	});
});
