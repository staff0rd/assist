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
import { removeBindMountContainers } from "./removeBindMountContainers";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(() => Promise.resolve("")) }));
vi.mock("./underTempRoot", () => ({ underTempRoot: () => false }));
vi.mock("./removeBindMountContainers", () => ({
	removeBindMountContainers: vi.fn(() => Promise.resolve()),
}));
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
const markMock = vi.mocked(markLeftover);
const clearMock = vi.mocked(clearLeftover);

let root: string;
let tree: string;

function recheck(accounted = new Set<string>()) {
	return recheckReapedWorktrees(accounted);
}

function reapedRecord(leftover?: string) {
	return {
		path: tree,
		clone: join(root, "repo"),
		origin: "o",
		harness: "claude" as const,
		leftover,
	};
}

describe("recheckReapedWorktrees", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		root = mkdtempSync(join(tmpdir(), "reaped-"));
		tree = join(root, "repo-2");
		registryMock.mockReturnValue([reapedRecord()]);
	});

	it("deletes a reaped tree that reappeared, removing its bind-mount containers first", async () => {
		mkdirSync(join(tree, "docker-local", "azure"), { recursive: true });

		await recheck();

		expect(existsSync(tree)).toBe(false);
		expect(vi.mocked(removeBindMountContainers)).toHaveBeenCalledWith(tree);
		expect(markMock).not.toHaveBeenCalled();
	});

	it("deletes a reappeared tree whatever it holds", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		writeFileSync(join(tree, "docker-local", "data.db"), "x");

		await recheck();

		expect(existsSync(tree)).toBe(false);
	});

	it("records the reason when the removal is deferred until Docker is reachable", async () => {
		mkdirSync(tree, { recursive: true });
		deleteMock.mockResolvedValueOnce({
			removed: false,
			reason: "Docker is not reachable",
			deferred: true,
		});

		await recheck();

		expect(markMock).toHaveBeenCalledWith(tree, "Docker is not reachable");
	});

	it("keeps a failed, non-deferred removal off the doctor list but retries it", async () => {
		mkdirSync(tree, { recursive: true });
		deleteMock.mockResolvedValueOnce({ removed: false, reason: "EBUSY" });

		await recheck();

		expect(markMock).toHaveBeenCalledWith(tree, undefined);
	});

	it("retries a deferred leftover on the next restart and clears it once deleted", async () => {
		mkdirSync(tree, { recursive: true });
		registryMock.mockReturnValue([reapedRecord("Docker is not reachable")]);

		await recheck();

		expect(existsSync(tree)).toBe(false);
		expect(clearMock).toHaveBeenCalledWith(tree);
	});

	it("clears a deferred leftover whose path has gone", async () => {
		registryMock.mockReturnValue([reapedRecord("Docker is not reachable")]);

		await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(clearMock).toHaveBeenCalledWith(tree);
	});

	it("leaves a reaped path a card already accounts for alone", async () => {
		mkdirSync(tree, { recursive: true });

		await recheck(new Set([tree]));

		expect(deleteMock).not.toHaveBeenCalled();
	});

	it("leaves a reaped path that now holds a git checkout alone", async () => {
		mkdirSync(join(tree, ".git"), { recursive: true });

		await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(markMock).not.toHaveBeenCalled();
	});
});
