import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { execGit } from "./execGit";
import { itemChangeSet } from "./itemChangeSet";
import { itemCommits } from "./itemCommits";

vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));
vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("./itemCommits", () => ({ itemCommits: vi.fn(async () => []) }));

const loadConfigFromMock = vi.mocked(loadConfigFrom);
const execGitMock = vi.mocked(execGit);
const itemCommitsMock = vi.mocked(itemCommits);

const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

type Repo = Record<string, { parent?: string; paths: string[] }>;

let sessions = 0;
const nextSession = () => `sess-${++sessions}`;

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
});
