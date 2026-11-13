import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as DeleteTreeModule from "./deleteTreeDirectly";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import {
	clearLeftover,
	markLeftover,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";
import { recheckReapedWorktrees } from "./recheckReapedWorktrees";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(() => Promise.resolve("")) }));
vi.mock("./underTempRoot", () => ({ underTempRoot: () => false }));
vi.mock("./readWorktreeRegistry", () => ({
	readReapedWorktreeRegistry: vi.fn(),
	markLeftover: vi.fn(),
	clearLeftover: vi.fn(),
}));
vi.mock("./deleteTreeDirectly", async (importActual) => {
	const actual = await importActual<typeof DeleteTreeModule>();
	return { deleteTreeDirectly: vi.fn(actual.deleteTreeDirectly) };
});

const registryMock = vi.mocked(readReapedWorktreeRegistry);
const deleteMock = vi.mocked(deleteTreeDirectly);

let root: string;
let tree: string;

function recheck(accounted = new Set<string>()) {
	return recheckReapedWorktrees(accounted);
}

describe("recheckReapedWorktrees", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		root = mkdtempSync(join(tmpdir(), "reaped-"));
		tree = join(root, "repo-2");
		registryMock.mockReturnValue([
			{ path: tree, clone: join(root, "repo"), origin: "o", harness: "claude" },
		]);
	});

	it("deletes a reaped tree that reappeared holding only empty directories", async () => {
		mkdirSync(join(tree, "docker-local", "azure"), { recursive: true });

		const leftovers = await recheck();

		expect(existsSync(tree)).toBe(false);
		expect(leftovers).toEqual([]);
	});

	it("reports and records a reappeared tree it cannot delete", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		const reason = `remove it with \`sudo rm -rf ${tree}\``;
		deleteMock.mockResolvedValueOnce({ removed: false, reason });

		const leftovers = await recheck();

		expect(leftovers).toEqual([{ path: tree, reason }]);
		expect(vi.mocked(markLeftover)).toHaveBeenCalledWith(tree, reason);
	});

	it("lists a recorded leftover still on disk without retrying its removal", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		registryMock.mockReturnValue([
			{
				path: tree,
				clone: join(root, "repo"),
				origin: "o",
				leftover: "EACCES",
			},
		]);

		const leftovers = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(leftovers).toEqual([{ path: tree, reason: "EACCES" }]);
	});

	it("clears a recorded leftover once its path is gone", async () => {
		registryMock.mockReturnValue([
			{
				path: tree,
				clone: join(root, "repo"),
				origin: "o",
				leftover: "EACCES",
			},
		]);

		const leftovers = await recheck();

		expect(leftovers).toEqual([]);
		expect(vi.mocked(clearLeftover)).toHaveBeenCalledWith(tree);
	});

	it("never deletes a reappeared tree holding files, surfacing it for review", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		writeFileSync(join(tree, "docker-local", "data.db"), "x");

		const leftovers = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(leftovers[0]?.reason).toContain(`rm -rf ${tree}`);
	});

	it("leaves a reaped path a card already accounts for alone", async () => {
		mkdirSync(tree, { recursive: true });

		const leftovers = await recheck(new Set([tree]));

		expect(deleteMock).not.toHaveBeenCalled();
		expect(leftovers).toEqual([]);
	});

	it("leaves a reaped path that now holds a git checkout alone", async () => {
		mkdirSync(join(tree, ".git"), { recursive: true });

		const leftovers = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(leftovers).toEqual([]);
	});

	it("ignores a reaped path that stayed gone", async () => {
		const leftovers = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(leftovers).toEqual([]);
	});
});
