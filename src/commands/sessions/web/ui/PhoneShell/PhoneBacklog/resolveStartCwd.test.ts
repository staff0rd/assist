import { describe, expect, it } from "vitest";
import type { MergedRepo } from "../../mergeRepos";
import { resolveStartCwd } from "./resolveStartCwd";

const repos: MergedRepo[] = [
	{
		key: "github.com/x/assist",
		origin: "github.com/x/assist",
		clones: { "": "/mac/assist", wsl: "/wsl/assist" },
	},
	{ key: "/mac/notes", clones: { "": "/mac/notes" } },
];

describe("resolveStartCwd", () => {
	it("uses the item's own cwd on the item's node", () => {
		const item = { cwd: "/mac/assist-3", key: "" };
		expect(resolveStartCwd(repos, item, "")).toBe("/mac/assist-3");
	});

	it("moves to the same repo's clone on another node", () => {
		const item = { cwd: "/mac/assist", key: "" };
		expect(resolveStartCwd(repos, item, "wsl")).toBe("/wsl/assist");
	});

	it("matches by origin when the cwd is not in history", () => {
		const item = {
			cwd: "/mac/assist-3",
			origin: "github.com/x/assist",
			key: "",
		};
		expect(resolveStartCwd(repos, item, "wsl")).toBe("/wsl/assist");
	});

	it("is undefined when the node has no clone", () => {
		const item = { cwd: "/mac/notes", key: "" };
		expect(resolveStartCwd(repos, item, "wsl")).toBeUndefined();
	});
});
