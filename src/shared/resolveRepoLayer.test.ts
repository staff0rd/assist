import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "./loadConfigFrom";
import { repoConfigCachePath } from "./readRepoConfigCache";
import { writeRepoConfigCache } from "./writeRepoConfigCache";

vi.mock("../commands/backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/org/assist",
}));

let dir: string;
let globalConfig: string;
let warn: ReturnType<typeof vi.spyOn>;

function writeGlobal(body: string): void {
	writeFileSync(globalConfig, body);
}

const worktreeEnabled = () =>
	loadConfigFrom(dir, globalConfig).worktree?.enabled ?? false;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "repo-layer-"));
	globalConfig = join(dir, ".assist.yml");
	rmSync(repoConfigCachePath(), { force: true });
	warn = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
	warn.mockRestore();
	rmSync(dir, { recursive: true, force: true });
});

describe("loadConfigFrom repo overrides", () => {
	it("merges the cached shared override for the current origin", () => {
		writeRepoConfigCache({
			"github.com/org/assist": { worktree: { enabled: true } },
		});

		expect(worktreeEnabled()).toBe(true);
	});

	it("matches a cached row keyed by the bare repo name", () => {
		writeRepoConfigCache({ assist: { worktree: { enabled: true } } });

		expect(worktreeEnabled()).toBe(true);
	});

	it("ignores another repo's cached override", () => {
		writeRepoConfigCache({ planner: { worktree: { enabled: true } } });

		expect(worktreeEnabled()).toBe(false);
	});

	it("falls back to a yml repos entry with a warning when the cache has none", () => {
		writeGlobal("repos:\n  org/assist:\n    worktree:\n      enabled: true\n");

		expect(worktreeEnabled()).toBe(true);
		expect(warn.mock.calls.flat().join("\n")).toContain(
			"repos.org/assist in ~/.assist.yml is not in the shared db",
		);
		expect(warn.mock.calls.flat().join("\n")).toContain(
			"assist config import-repos",
		);
	});

	it("ignores the yml entry once the cache holds an override for the repo", () => {
		writeGlobal("repos:\n  assist:\n    worktree:\n      enabled: true\n");
		writeRepoConfigCache({
			"github.com/org/assist": { worktree: { enabled: false } },
		});

		expect(worktreeEnabled()).toBe(false);
		expect(warn).not.toHaveBeenCalled();
	});

	it("uses the last snapshot without touching the db", () => {
		writeRepoConfigCache({
			"github.com/org/assist": { worktree: { enabled: true } },
		});
		vi.stubEnv("ASSIST_DATABASE_URL", "postgresql://unreachable.invalid/db");

		expect(worktreeEnabled()).toBe(true);
		vi.unstubAllEnvs();
	});

	it("treats a corrupt cache as empty", () => {
		writeFileSync(repoConfigCachePath(), "{not json");

		expect(worktreeEnabled()).toBe(false);
	});
});
