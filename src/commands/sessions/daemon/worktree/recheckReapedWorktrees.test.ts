import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as DeleteTreeModule from "./deleteTreeDirectly";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import {
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
}));
vi.mock("./deleteTreeDirectly", async (importActual) => {
	const actual = await importActual<typeof DeleteTreeModule>();
	return { deleteTreeDirectly: vi.fn(actual.deleteTreeDirectly) };
});

const registryMock = vi.mocked(readReapedWorktreeRegistry);
const deleteMock = vi.mocked(deleteTreeDirectly);
const markMock = vi.mocked(markLeftover);

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

		await recheck();

		expect(existsSync(tree)).toBe(false);
		expect(markMock).not.toHaveBeenCalled();
	});

	it("records a reappeared tree it cannot delete as a leftover", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		const reason = "EACCES: permission denied";
		deleteMock.mockResolvedValueOnce({ removed: false, reason });

		await recheck();

		expect(markMock).toHaveBeenCalledWith(tree, reason);
	});

	it("does not retry the removal of a recorded leftover", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		registryMock.mockReturnValue([
			{
				path: tree,
				clone: join(root, "repo"),
				origin: "o",
				leftover: "EACCES",
			},
		]);

		await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(markMock).not.toHaveBeenCalled();
	});

	it("never deletes a reappeared tree holding files, recording it for review", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		writeFileSync(join(tree, "docker-local", "data.db"), "x");

		await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(existsSync(tree)).toBe(true);
		expect(markMock.mock.calls[0]?.[1]).toContain("will not delete unreviewed");
	});

	it("leaves a reaped path a card already accounts for alone", async () => {
		mkdirSync(tree, { recursive: true });

		await recheck(new Set([tree]));

		expect(deleteMock).not.toHaveBeenCalled();
		expect(markMock).not.toHaveBeenCalled();
	});

	it("leaves a reaped path that now holds a git checkout alone", async () => {
		mkdirSync(join(tree, ".git"), { recursive: true });

		await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(markMock).not.toHaveBeenCalled();
	});

	it("ignores a reaped path that stayed gone", async () => {
		await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(markMock).not.toHaveBeenCalled();
	});
});
