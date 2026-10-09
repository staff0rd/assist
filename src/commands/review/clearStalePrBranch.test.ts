import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearStalePrBranch } from "./clearStalePrBranch";

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const created: string[] = [];

afterEach(() => {
	for (const base of created.splice(0))
		rmSync(base, { recursive: true, force: true });
});

function runGit(cwd: string, ...args: string[]): string {
	return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function commit(cwd: string, name: string): void {
	writeFileSync(join(cwd, name), name);
	runGit(cwd, "add", ".");
	runGit(cwd, "commit", "-q", "-m", name);
}

function identify(cwd: string): void {
	runGit(cwd, "config", "user.email", "test@example.com");
	runGit(cwd, "config", "user.name", "test");
}

function cloneWithStalePrBranch() {
	const base = realpathSync(mkdtempSync(join(tmpdir(), "stale-pr-")));
	created.push(base);
	const author = join(base, "author");
	const upstream = join(base, "upstream.git");
	const clone = join(base, "clone");
	runGit(base, "init", "-q", "-b", "main", author);
	identify(author);
	commit(author, "base");
	runGit(author, "checkout", "-q", "-b", "feat");
	commit(author, "feat-1");
	runGit(base, "clone", "-q", "--bare", author, upstream);
	runGit(author, "remote", "add", "origin", upstream);
	runGit(base, "clone", "-q", "-b", "main", upstream, clone);
	identify(clone);
	runGit(clone, "checkout", "-q", "-b", "feat", "origin/feat");
	runGit(clone, "checkout", "-q", "main");
	const forcePush = () => {
		runGit(author, "reset", "-q", "--hard", "main");
		commit(author, "feat-rewritten");
		runGit(author, "push", "-q", "--force", "origin", "feat");
		runGit(clone, "fetch", "-q", "origin");
	};
	return { clone, forcePush };
}

function branchExists(cwd: string, branch: string): boolean {
	try {
		runGit(cwd, "rev-parse", "--verify", "--quiet", `refs/heads/${branch}`);
		return true;
	} catch {
		return false;
	}
}

describe("clearStalePrBranch", () => {
	it("reports a missing branch as absent", () => {
		const { clone } = cloneWithStalePrBranch();

		expect(clearStalePrBranch(clone, "other")).toBe("absent");
	});

	it("clears a branch whose remote head was rewritten", () => {
		const { clone, forcePush } = cloneWithStalePrBranch();
		forcePush();

		expect(clearStalePrBranch(clone, "feat")).toBe("cleared");
		expect(branchExists(clone, "feat")).toBe(false);
	});

	it("clears a fork PR branch fetched straight into a local branch", () => {
		const { clone, forcePush } = cloneWithStalePrBranch();
		runGit(clone, "fetch", "-q", "origin", "refs/heads/feat:fork-feat");
		forcePush();

		expect(clearStalePrBranch(clone, "fork-feat")).toBe("cleared");
		expect(branchExists(clone, "fork-feat")).toBe(false);
	});

	it("keeps a branch holding commits made locally", () => {
		const { clone, forcePush } = cloneWithStalePrBranch();
		runGit(clone, "checkout", "-q", "feat");
		commit(clone, "local-work");
		runGit(clone, "checkout", "-q", "main");
		forcePush();

		expect(clearStalePrBranch(clone, "feat")).toBe("local-work");
		expect(branchExists(clone, "feat")).toBe(true);
	});
});
