import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listReleasedMigrationIds } from "./listReleasedMigrationIds";

let repo: string;
const dir = ["src", "shared", "db", "migrations"];

function git(command: string): void {
	execSync(`git -c user.name=t -c user.email=t@t ${command}`, {
		cwd: repo,
		stdio: "pipe",
	});
}

function addFile(name: string): void {
	mkdirSync(join(repo, ...dir), { recursive: true });
	writeFileSync(join(repo, ...dir, name), "x\n");
}

beforeEach(() => {
	repo = mkdtempSync(join(tmpdir(), "assist-released-"));
	git("init -q");
});

afterEach(() => {
	rmSync(repo, { recursive: true, force: true });
});

describe("listReleasedMigrationIds", () => {
	it("reads migration ids from origin/main only", () => {
		addFile("migration0001Init.ts");
		addFile("migration0012Foo.ts");
		addFile("applyMigrations.ts");
		git("add -A");
		git("commit -qm released");
		git("update-ref refs/remotes/origin/main HEAD");
		addFile("migration0013PhaseRunState.ts");
		git("add -A");
		git("commit -qm unreleased");

		expect(listReleasedMigrationIds(repo)).toEqual(new Set([1, 12]));
	});

	it("returns null without origin/main", () => {
		expect(listReleasedMigrationIds(repo)).toBeNull();
	});
});
