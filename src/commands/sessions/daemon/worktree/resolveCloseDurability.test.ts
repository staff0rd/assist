import { execFileSync, spawn } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readlinkSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import { daemonLog } from "../daemonLog";
import { dismissSession } from "../dismissSession";
import { reapWorktree } from "./reapWorktree";
import { resolveCloseDurability } from "./resolveCloseDurability";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../../shared/emitActivity", () => ({ removeActivity: vi.fn() }));
vi.mock("../../../backlog/acquireLock", () => ({ releaseLock: vi.fn() }));
vi.mock("./treeDurability", () => ({
	checkDurability: vi.fn(() => Promise.resolve({ durable: true })),
}));
vi.mock("./reapWorktree", () => ({
	reapWorktree: vi.fn((path: string) => {
		rmSync(path, { recursive: true, force: true });
		return Promise.resolve({ removed: true });
	}),
}));

const logMock = daemonLog as unknown as ReturnType<typeof vi.fn>;
const created: string[] = [];

afterEach(() => {
	vi.clearAllMocks();
	for (const base of created.splice(0))
		rmSync(base, { recursive: true, force: true });
});

function makeCloneWithWorktree(): { clone: string; tree: string } {
	const base = realpathSync(mkdtempSync(join(tmpdir(), "close-reap-")));
	created.push(base);
	const clone = join(base, "repo");
	const tree = join(base, "repo-2");
	mkdirSync(clone);
	const git = (...args: string[]) => execFileSync("git", args, { cwd: clone });
	git("init", "-b", "main");
	git("config", "user.email", "test@example.com");
	git("config", "user.name", "test");
	writeFileSync(join(clone, "README.md"), "x");
	git("add", ".");
	git("commit", "-m", "init");
	git("worktree", "add", "-b", "repo-2", tree);
	return { clone, tree };
}

describe("resolveCloseDurability", () => {
	it("reaps the clone's watcher when its last session closes from a reaped worktree", async () => {
		const { clone, tree } = makeCloneWithWorktree();
		const watcher = makeSession({
			id: "1",
			status: "waiting",
			cwd: clone,
			watcher: true,
		});
		const worker = makeSession({
			id: "2",
			status: "waiting",
			cwd: tree,
			worktree: { path: tree, clone },
		});
		const sessions = new Map([
			[watcher.id, watcher],
			[worker.id, worker],
		]);

		await resolveCloseDurability(
			worker,
			() => dismissSession(sessions, worker.id),
			vi.fn(),
		);

		expect(sessions.size).toBe(0);
		expect(logMock).toHaveBeenCalledWith(
			`reaping watcher session 1 for the clone ${clone}: its last session 2 was dismissed`,
		);
	});

	it.skipIf(process.platform !== "linux")(
		"holds the worktree while a live process is running in it",
		async () => {
			const { clone, tree } = makeCloneWithWorktree();
			const orphan = spawn("sleep", ["30"], { cwd: tree });
			try {
				await vi.waitFor(() =>
					expect(readlinkSync(`/proc/${orphan.pid}/cwd`)).toBe(tree),
				);
				const worker = makeSession({
					id: "2",
					status: "waiting",
					cwd: tree,
					worktree: { path: tree, clone },
				});
				const finalize = vi.fn();

				await resolveCloseDurability(worker, finalize, vi.fn());

				expect(finalize).not.toHaveBeenCalled();
				expect(reapWorktree).not.toHaveBeenCalled();
				expect(worker.status).toBe("stopped");
				expect(worker.undurable?.reason).toBe(
					`a live process is still running in it (pid ${orphan.pid})`,
				);
				worker.gitWatcher?.close();
			} finally {
				orphan.kill("SIGKILL");
			}
		},
	);
});
