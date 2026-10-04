import { type ChildProcess, execFileSync, spawn } from "node:child_process";
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
import { checkDurability } from "./treeDurability";

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

	describe.skipIf(process.platform !== "linux")("with a live process", () => {
		let orphan: ChildProcess | undefined;

		afterEach(() => {
			vi.useRealTimers();
			orphan?.kill("SIGKILL");
			orphan = undefined;
		});

		async function occupiedWorker(closing?: boolean) {
			const { clone, tree } = makeCloneWithWorktree();
			const child = spawn("sleep", ["30"], { cwd: tree });
			orphan = child;
			await vi.waitFor(() =>
				expect(readlinkSync(`/proc/${child.pid}/cwd`)).toBe(tree),
			);
			const worker = makeSession({
				id: "2",
				status: "waiting",
				cwd: tree,
				worktree: { path: tree, clone },
				closing,
			});
			return { worker, child, finalize: vi.fn(), notify: vi.fn() };
		}

		function liveReason(child: ChildProcess) {
			return `a live process is still running in it (pid ${child.pid})`;
		}

		it("holds a stopped card at once when it is not closing", async () => {
			const { worker, child, finalize, notify } = await occupiedWorker();

			await resolveCloseDurability(worker, finalize, notify);

			expect(finalize).not.toHaveBeenCalled();
			expect(reapWorktree).not.toHaveBeenCalled();
			expect(worker.status).toBe("stopped");
			expect(worker.undurable?.reason).toBe(liveReason(child));
			worker.gitWatcher?.close();
		});

		it("keeps closing and reaps once the process exits inside the window", async () => {
			const { worker, child, finalize, notify } = await occupiedWorker(true);
			vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

			const closing = resolveCloseDurability(worker, finalize, notify);
			await vi.advanceTimersByTimeAsync(1000);
			expect(worker.closing).toBe(true);
			expect(worker.status).toBe("waiting");
			const exited = new Promise((resolve) => child.once("exit", resolve));
			child.kill("SIGKILL");
			await exited;
			await vi.advanceTimersByTimeAsync(500);
			await closing;

			expect(finalize).toHaveBeenCalledOnce();
			expect(reapWorktree).toHaveBeenCalled();
			expect(worker.undurable).toBeUndefined();
			expect(worker.closing).toBeUndefined();
		});

		it("holds a stopped card when the process outlives the window", async () => {
			const { worker, child, finalize, notify } = await occupiedWorker(true);
			vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

			const closing = resolveCloseDurability(worker, finalize, notify);
			await vi.advanceTimersByTimeAsync(4500);
			expect(worker.status).toBe("waiting");
			await vi.advanceTimersByTimeAsync(500);
			await closing;

			expect(finalize).not.toHaveBeenCalled();
			expect(worker.status).toBe("stopped");
			expect(worker.closing).toBeUndefined();
			expect(worker.undurable?.reason).toBe(liveReason(child));
			worker.gitWatcher?.close();
		});

		it("holds a durability block at once without waiting", async () => {
			vi.mocked(checkDurability).mockResolvedValueOnce({
				durable: false,
				reason: "uncommitted changes",
			});
			const { worker, finalize, notify } = await occupiedWorker(true);

			await resolveCloseDurability(worker, finalize, notify);

			expect(worker.closeGrace).toBeUndefined();
			expect(worker.status).toBe("stopped");
			expect(worker.undurable?.reason).toBe("uncommitted changes");
			worker.gitWatcher?.close();
		});

		it("abandons the wait when the session is respawned mid-wait", async () => {
			const { worker, finalize, notify } = await occupiedWorker(true);
			vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

			const closing = resolveCloseDurability(worker, finalize, notify);
			await vi.advanceTimersByTimeAsync(500);
			worker.closeGrace?.cancel();
			await closing;

			expect(finalize).not.toHaveBeenCalled();
			expect(worker.status).toBe("waiting");
			expect(worker.undurable).toBeUndefined();
		});
	});
});
