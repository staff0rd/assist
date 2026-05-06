import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import {
	getPreferredRemoteRepo,
	parseGitHubUrl,
} from "./getPreferredRemoteRepo";

type ExecCall = (cmd: string) => string;

function setupGit(handler: ExecCall): void {
	mockExecSync.mockImplementation((cmd: string) => {
		const result = handler(cmd);
		if (result === undefined) {
			throw new Error(`Unexpected command: ${cmd}`);
		}
		return result;
	});
}

describe("parseGitHubUrl", () => {
	it("parses ssh GitHub URLs", () => {
		expect(parseGitHubUrl("git@github.com:owner/repo.git")).toEqual({
			org: "owner",
			repo: "repo",
		});
	});

	it("parses ssh GitHub URLs without .git", () => {
		expect(parseGitHubUrl("git@github.com:owner/repo")).toEqual({
			org: "owner",
			repo: "repo",
		});
	});

	it("parses https GitHub URLs", () => {
		expect(parseGitHubUrl("https://github.com/owner/repo.git")).toEqual({
			org: "owner",
			repo: "repo",
		});
	});

	it("parses https GitHub URLs without .git", () => {
		expect(parseGitHubUrl("https://github.com/owner/repo")).toEqual({
			org: "owner",
			repo: "repo",
		});
	});

	it("returns null for non-GitHub URLs", () => {
		expect(parseGitHubUrl("git@gitlab.com:owner/repo.git")).toBeNull();
	});
});

describe("getPreferredRemoteRepo", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("prefers the remote tracked by the current branch", () => {
		setupGit((cmd) => {
			if (cmd.includes("@{u}")) return "origin/main";
			if (cmd === "git remote") return "origin\nupstream";
			if (cmd === "git remote get-url origin") {
				return "git@github.com:eventsair/eventsair-bi.git";
			}
			if (cmd === "git remote get-url upstream") {
				return "git@github.com:MakerXStudio/other.git";
			}
			return "";
		});

		expect(getPreferredRemoteRepo()).toEqual({
			org: "eventsair",
			repo: "eventsair-bi",
		});
	});

	it("falls back to origin when current branch has no upstream tracking", () => {
		setupGit((cmd) => {
			if (cmd.includes("@{u}")) {
				throw new Error("no upstream configured");
			}
			if (cmd === "git remote") return "origin\nupstream";
			if (cmd === "git remote get-url origin") {
				return "git@github.com:eventsair/eventsair-bi.git";
			}
			if (cmd === "git remote get-url upstream") {
				return "git@github.com:MakerXStudio/other.git";
			}
			return "";
		});

		expect(getPreferredRemoteRepo()).toEqual({
			org: "eventsair",
			repo: "eventsair-bi",
		});
	});

	it("prefers origin over upstream when current branch tracks origin", () => {
		setupGit((cmd) => {
			if (cmd.includes("@{u}")) return "origin/feature-branch";
			if (cmd === "git remote") return "origin\nupstream";
			if (cmd === "git remote get-url origin") {
				return "https://github.com/eventsair/eventsair-bi";
			}
			if (cmd === "git remote get-url upstream") {
				return "https://github.com/MakerXStudio/other";
			}
			return "";
		});

		expect(getPreferredRemoteRepo()).toEqual({
			org: "eventsair",
			repo: "eventsair-bi",
		});
	});

	it("does not fall back to upstream when origin lookup fails", () => {
		setupGit((cmd) => {
			if (cmd.includes("@{u}")) {
				throw new Error("no upstream configured");
			}
			if (cmd === "git remote") return "upstream";
			if (cmd === "git remote get-url origin") {
				throw new Error("No such remote 'origin'");
			}
			if (cmd === "git remote get-url upstream") {
				return "git@github.com:MakerXStudio/other.git";
			}
			return "";
		});

		expect(getPreferredRemoteRepo()).toBeNull();
	});

	it("returns null when no GitHub remote can be resolved", () => {
		setupGit((cmd) => {
			if (cmd.includes("@{u}")) {
				throw new Error("no upstream configured");
			}
			if (cmd === "git remote") return "";
			if (cmd === "git remote get-url origin") {
				throw new Error("No such remote 'origin'");
			}
			return "";
		});

		expect(getPreferredRemoteRepo()).toBeNull();
	});
});
