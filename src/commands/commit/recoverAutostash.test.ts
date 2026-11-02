import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listStashShas, recoverAutostash } from "./recoverAutostash";

function sh(cmd: string): string {
	return execSync(cmd, { cwd: repo, encoding: "utf8", stdio: "pipe" });
}

let repo: string;
const originalCwd = process.cwd();

function strandAutostash(message: string): string {
	writeFileSync(join(repo, "file.txt"), `${message}\n`);
	const sha = sh("git stash create").trim();
	sh(`git stash store -m ${message} ${sha}`);
	sh("git reset -q --hard");
	return sha;
}

describe("recoverAutostash", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		for (const key of ["GIT_DIR", "GIT_INDEX_FILE", "GIT_WORK_TREE"]) {
			vi.stubEnv(key, undefined);
		}
		repo = mkdtempSync(join(tmpdir(), "assist-autostash-"));
		sh("git init -q -b main && git config user.email t@t");
		sh("git config user.name t");
		writeFileSync(join(repo, "file.txt"), "base\n");
		sh("git add -A && git commit -q -m init");
		process.chdir(repo);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		vi.unstubAllEnvs();
		rmSync(repo, { recursive: true, force: true });
	});

	it("reapplies a stranded autostash by SHA and drops only that entry", () => {
		const head = sh("git rev-parse HEAD").trim();
		const other = strandAutostash("unrelated");
		const before = listStashShas();
		strandAutostash("autostash");

		recoverAutostash(head, before);

		expect(readFileSync(join(repo, "file.txt"), "utf8")).toBe("autostash\n");
		expect(listStashShas()).toEqual([other]);
	});

	it("refuses with apply guidance when the autostash cannot be reapplied", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const head = sh("git rev-parse HEAD").trim();
		const before = listStashShas();
		const sha = strandAutostash("autostash");
		writeFileSync(join(repo, "file.txt"), "dirty\n");

		expect(() => recoverAutostash(head, before)).toThrow(
			`git stash apply ${sha}`,
		);
		expect(listStashShas()).toEqual([sha]);
	});

	it("ignores autostash entries that existed before the pull", () => {
		const head = sh("git rev-parse HEAD").trim();
		const old = strandAutostash("autostash");

		recoverAutostash(head, listStashShas());

		expect(readFileSync(join(repo, "file.txt"), "utf8")).toBe("base\n");
		expect(listStashShas()).toEqual([old]);
	});
});
