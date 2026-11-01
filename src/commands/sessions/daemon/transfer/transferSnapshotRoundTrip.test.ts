import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pushTransferSnapshot } from "./pushTransferSnapshot";
import { restoreTransferSnapshot } from "./restoreTransferSnapshot";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function sh(cmd: string, cwd: string): string {
	return execSync(cmd, { cwd, encoding: "utf8", stdio: "pipe" }).trim();
}

const REF = "assist/transfer/a1";
let root: string;
let remote: string;

function cloneAs(name: string): string {
	sh(`git clone -q "${remote}" ${name}`, root);
	const path = join(root, name);
	sh("git config user.email t@t && git config user.name t", path);
	return path;
}

function addWorktree(clone: string, name: string, track: boolean): string {
	const path = join(root, name);
	sh(
		`git worktree add -q ${track ? "--track" : "--no-track"} -b ${name} "${path}" origin/main`,
		clone,
	);
	return path;
}

function makeWork(path: string): void {
	writeFileSync(join(path, "committed.txt"), "unpushed\n");
	sh('git add committed.txt && git commit -q -m "unpushed work"', path);
	writeFileSync(join(path, "tracked.txt"), "edited\n");
	writeFileSync(join(path, "new.txt"), "brand new\n");
}

function expectRestored(path: string, upstream: string): void {
	expect(readFileSync(join(path, "tracked.txt"), "utf8")).toBe("edited\n");
	expect(readFileSync(join(path, "new.txt"), "utf8")).toBe("brand new\n");
	expect(sh("git log -1 --format=%s", path)).toBe("unpushed work");
	expect(sh(`git log --format=%s origin/${upstream}..HEAD`, path)).toBe(
		"unpushed work",
	);
	const status = sh("git status --porcelain", path);
	expect(status).toContain("tracked.txt");
	expect(status).toContain("new.txt");
	expect(sh(`git ls-remote origin refs/heads/${REF}`, path)).toBe("");
	expect(sh(`git log --format=%s origin/${upstream}`, path)).not.toContain(
		"assist transfer WIP",
	);
}

describe("transfer snapshot round trip", () => {
	beforeEach(() => {
		for (const key of ["GIT_DIR", "GIT_INDEX_FILE", "GIT_WORK_TREE"])
			vi.stubEnv(key, undefined);
		root = mkdtempSync(join(tmpdir(), "assist-transfer-"));
		remote = join(root, "remote.git");
		sh(`git init -q --bare -b main "${remote}"`, root);
		const seed = cloneAs("seed");
		writeFileSync(join(seed, "tracked.txt"), "original\n");
		sh(
			"git add -A && git commit -q -m init && git push -q -u origin main",
			seed,
		);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		rmSync(root, { recursive: true, force: true });
	});

	it("carries a story branch with unpushed commits and uncommitted files", async () => {
		const source = addWorktree(cloneAs("source"), "assist-2", false);
		sh("git checkout -q -b feat/x && git push -q -u origin feat/x", source);
		makeWork(source);
		const before = sh("git status --porcelain", source);

		const snapshot = await pushTransferSnapshot(source, "a1", source);
		expect(snapshot).toEqual({
			ref: REF,
			branch: "feat/x",
			upstream: "feat/x",
		});
		expect(sh("git status --porcelain", source)).toBe(before);
		expect(sh("git log -1 --format=%s", source)).toBe("unpushed work");

		const target = addWorktree(cloneAs("target"), "assist-5", false);
		await restoreTransferSnapshot(target, snapshot);
		expect(sh("git symbolic-ref --short HEAD", target)).toBe("feat/x");
		expect(sh("git rev-parse --abbrev-ref @{u}", target)).toBe("origin/feat/x");
		expectRestored(target, "feat/x");
	});

	it("carries a run on main into the target tree's own branch", async () => {
		const source = addWorktree(cloneAs("source"), "assist-2", true);
		makeWork(source);

		const snapshot = await pushTransferSnapshot(source, "a1", source);
		expect(snapshot).toEqual({ ref: REF, branch: undefined, upstream: "main" });

		const target = addWorktree(cloneAs("target"), "assist-2-t", false);
		await restoreTransferSnapshot(target, snapshot);
		expect(sh("git symbolic-ref --short HEAD", target)).toBe("assist-2-t");
		expect(sh("git rev-parse --abbrev-ref @{u}", target)).toBe("origin/main");
		expectRestored(target, "main");
		expect(sh("git log -1 --format=%s origin/main", target)).toBe("init");
	});

	it("carries an in-place run on the clone's main", async () => {
		const source = cloneAs("source");
		makeWork(source);

		const snapshot = await pushTransferSnapshot(source, "a1");
		expect(snapshot.branch).toBe("main");

		const target = addWorktree(cloneAs("target"), "assist-9", false);
		await restoreTransferSnapshot(target, snapshot);
		expect(sh("git symbolic-ref --short HEAD", target)).toBe("assist-9");
		expectRestored(target, "main");
	});

	it("refuses to restore over a dirty tree and leaves the ref on origin", async () => {
		const source = cloneAs("source");
		makeWork(source);
		const snapshot = await pushTransferSnapshot(source, "a1");
		const target = cloneAs("target");
		writeFileSync(join(target, "tracked.txt"), "local edit\n");

		await expect(restoreTransferSnapshot(target, snapshot)).rejects.toThrow(
			/uncommitted changes/,
		);
		expect(sh(`git ls-remote origin refs/heads/${REF}`, target)).not.toBe("");
	});
});
