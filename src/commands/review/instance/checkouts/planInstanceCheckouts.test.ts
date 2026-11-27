import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { CompanionLookup } from "./CompanionHead";
import { findLinkedPr } from "./findLinkedPr";
import { parseRemoteHead } from "./parseRemoteHead";
import { planInstanceCheckouts } from "./planInstanceCheckouts";

const apiSha = "a".repeat(40);
const mainSha = "b".repeat(40);
const linkedSha = "c".repeat(40);

function lookup(): CompanionLookup {
	return {
		remoteRepo: vi.fn(() => ({ org: "acme", repo: "web" })),
		prHead: vi.fn(() => linkedSha),
		remoteHead: vi.fn(() => `ref: refs/heads/main\tHEAD\n${mainSha}\tHEAD\n`),
	};
}

function plan(body: string, companion = lookup()) {
	return planInstanceCheckouts({
		services: {
			api: { port: 8080 },
			web: { port: 3000, repo: "../frontend" },
			storybook: { repo: "../frontend" },
		},
		repoRoot: "/src/api",
		pr: { fullName: "acme/api", number: 7, sha: apiSha, body },
		worktreeBase: "/instances/p",
		lookup: companion,
	});
}

describe("findLinkedPr", () => {
	it.each([
		["Needs https://github.com/acme/web/pull/12 too", 12],
		["Pairs with acme/web#34.", 34],
		["Pairs with ACME/Web#5", 5],
		["Fixes #9 and acme/web-admin#3", null],
		["See https://github.com/acme/other/pull/12", null],
	])("finds the companion PR in %j", (body, expected) => {
		expect(findLinkedPr(body, "acme/web")).toBe(expected);
	});
});

describe("parseRemoteHead", () => {
	it("reads the default branch and its sha", () => {
		expect(
			parseRemoteHead(`ref: refs/heads/develop\tHEAD\n${mainSha}\tHEAD\n`),
		).toEqual({ branch: "develop", sha: mainSha });
	});

	it("returns null without a symref", () => {
		expect(parseRemoteHead(`${mainSha}\tHEAD\n`)).toBeNull();
	});
});

describe("planInstanceCheckouts", () => {
	it("expands a leading ~/ in a companion repo path", () => {
		const [, web] = planInstanceCheckouts({
			services: { api: { port: 8080 }, web: { repo: "~/git/frontend" } },
			repoRoot: "/src/api",
			pr: { fullName: "acme/api", number: 7, sha: apiSha, body: "" },
			worktreeBase: "/instances/p",
			lookup: lookup(),
		});
		expect(web.repoRoot).toBe(join(homedir(), "git/frontend"));
	});

	it("checks a companion out at the PR linked in the reviewed PR's body", () => {
		const companion = lookup();
		const [reviewed, web] = plan(
			"Needs https://github.com/acme/web/pull/12",
			companion,
		);
		expect(reviewed).toEqual({
			repo: "acme/api",
			repoRoot: "/src/api",
			dir: "/instances/p",
			sha: apiSha,
			fetchRef: "pull/7/head",
			source: "PR #7",
			services: ["api"],
		});
		expect(web).toEqual({
			repo: "acme/web",
			repoRoot: "/src/frontend",
			dir: "/instances/p-frontend",
			sha: linkedSha,
			fetchRef: "pull/12/head",
			source: "linked PR #12",
			services: ["web", "storybook"],
		});
		expect(companion.prHead).toHaveBeenCalledWith(12, {
			org: "acme",
			repo: "web",
		});
		expect(companion.remoteRepo).toHaveBeenCalledWith("/src/frontend");
	});

	it("falls back to the companion's default branch head", () => {
		const companion = lookup();
		const [, web] = plan("No companion change", companion);
		expect(web).toMatchObject({
			sha: mainSha,
			fetchRef: "refs/heads/main",
			source: "default branch main",
		});
		expect(companion.remoteHead).toHaveBeenCalledWith("/src/frontend");
		expect(companion.prHead).not.toHaveBeenCalled();
	});

	it("rejects a companion clone without a GitHub remote", () => {
		const companion = lookup();
		vi.mocked(companion.remoteRepo).mockReturnValue(null);
		expect(() => plan("", companion)).toThrow(
			/review.instance.services.web.repo \(\/src\/frontend\)/,
		);
	});
});
