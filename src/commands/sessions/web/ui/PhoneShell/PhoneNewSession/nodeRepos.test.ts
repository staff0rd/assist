import { describe, expect, it } from "vitest";
import type { MergedRepo } from "../../mergeRepos";
import { nodeRepos, resolveNodeCwd } from "./nodeRepos";

const repos: MergedRepo[] = [
	{ key: "assist", clones: { "": "/mac/assist", wsl: "/wsl/assist" } },
	{ key: "collab", clones: { wsl: "/wsl/collab" } },
	{ key: "notes", clones: { "": "/mac/notes" } },
];

describe("nodeRepos", () => {
	it("lists only the repos cloned on the node", () => {
		expect(nodeRepos(repos, "wsl")).toEqual(["/wsl/assist", "/wsl/collab"]);
	});
});

describe("resolveNodeCwd", () => {
	it("keeps a pick that exists on the node", () => {
		expect(resolveNodeCwd(repos, "wsl", "/wsl/collab")).toBe("/wsl/collab");
	});

	it("moves a pick to its clone on the node", () => {
		expect(resolveNodeCwd(repos, "wsl", "/mac/assist")).toBe("/wsl/assist");
	});

	it("falls back to the node's first repo", () => {
		expect(resolveNodeCwd(repos, "wsl", "/mac/notes")).toBe("/wsl/assist");
		expect(resolveNodeCwd(repos, "", undefined)).toBe("/mac/assist");
	});
});
