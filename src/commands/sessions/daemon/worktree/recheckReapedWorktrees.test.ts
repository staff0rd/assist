import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../createSession";
import type * as DeleteTreeModule from "./deleteTreeDirectly";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import {
	forgetWorktree,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";
import { recheckReapedWorktrees } from "./recheckReapedWorktrees";

vi.mock("./leftoverSurfacingEnabled", () => ({
	leftoverSurfacingEnabled: true,
}));
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(() => Promise.resolve("")) }));
vi.mock("./underTempRoot", () => ({ underTempRoot: () => false }));
vi.mock("./readWorktreeRegistry", () => ({
	readReapedWorktreeRegistry: vi.fn(),
	forgetWorktree: vi.fn(),
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
	const sessions = new Map<string, Session>();
	const spawnWith = (create: (id: string) => Session) => {
		const session = create(String(sessions.size + 1));
		sessions.set(session.id, session);
		return session.id;
	};
	return recheckReapedWorktrees(accounted, spawnWith, () => {}).then(
		() => sessions,
	);
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

		const sessions = await recheck();

		expect(existsSync(tree)).toBe(false);
		expect(sessions.size).toBe(0);
	});

	it("surfaces the removal command when the reappeared tree cannot be deleted", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		deleteMock.mockResolvedValueOnce({
			removed: false,
			reason: `remove it with \`sudo rm -rf ${tree}\``,
		});

		const sessions = await recheck();

		const card = [...sessions.values()][0];
		expect(card?.status).toBe("error");
		expect(card?.name).toBe("leftover repo-2");
		expect(card?.cwd).toBe(tree);
		expect(card?.error).toContain(`sudo rm -rf ${tree}`);
		expect(card?.scrollback).toContain(`sudo rm -rf ${tree}`);
		expect(vi.mocked(forgetWorktree)).toHaveBeenCalledWith(tree);
	});

	it("never deletes a reappeared tree holding files, surfacing it for review", async () => {
		mkdirSync(join(tree, "docker-local"), { recursive: true });
		writeFileSync(join(tree, "docker-local", "data.db"), "x");

		const sessions = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		const card = [...sessions.values()][0];
		expect(card?.error).toContain(`rm -rf ${tree}`);
	});

	it("leaves a reaped path a card already accounts for alone", async () => {
		mkdirSync(tree, { recursive: true });

		const sessions = await recheck(new Set([tree]));

		expect(deleteMock).not.toHaveBeenCalled();
		expect(sessions.size).toBe(0);
	});

	it("leaves a reaped path that now holds a git checkout alone", async () => {
		mkdirSync(join(tree, ".git"), { recursive: true });

		const sessions = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(sessions.size).toBe(0);
	});

	it("ignores a reaped path that stayed gone", async () => {
		const sessions = await recheck();

		expect(deleteMock).not.toHaveBeenCalled();
		expect(sessions.size).toBe(0);
	});
});
