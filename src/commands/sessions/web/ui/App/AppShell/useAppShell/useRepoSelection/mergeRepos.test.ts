import { describe, expect, it } from "vitest";
import type { HistoricalSession } from "../../../../types";
import { mergeRepos, preferredClone } from "./mergeRepos";
import { resolveSelectedNode } from "./resolveSelectedNode";

const origin = "github.com/org/app";

function entry(
	cwd: string,
	node?: string,
	repoOrigin: string | undefined = origin,
): HistoricalSession {
	return {
		sessionId: `${node ?? "local"}-${cwd}`,
		name: "s",
		project: "p",
		cwd,
		timestamp: "2026-01-01",
		repoGroup: repoOrigin ? { origin: repoOrigin, clone: cwd } : undefined,
		node,
	};
}

const windowsClone = String.raw`C:\git\app`;
const history = [
	entry("/git/app"),
	entry(windowsClone, "pc-windows"),
	entry(String.raw`C:\git\only-windows`, "pc-windows", "github.com/org/win"),
];

describe("mergeRepos", () => {
	it("lists each origin once with its clone on every node", () => {
		expect(mergeRepos("", history)).toEqual([
			{
				key: origin,
				origin,
				clones: { "": "/git/app", "pc-windows": windowsClone },
			},
			{
				key: "github.com/org/win",
				origin: "github.com/org/win",
				clones: { "pc-windows": String.raw`C:\git\only-windows` },
			},
		]);
	});

	it("displays the clone on the preferred node, falling back to local", () => {
		const [app, win] = mergeRepos("", history);
		expect(preferredClone(app, "pc-windows")).toBe(windowsClone);
		expect(preferredClone(app, "mac")).toBe("/git/app");
		expect(preferredClone(win, "")).toBe(String.raw`C:\git\only-windows`);
	});
});

describe("resolveSelectedNode", () => {
	const repos = mergeRepos("", history);

	it("keeps a pinned node", () => {
		expect(
			resolveSelectedNode(repos, { cwd: windowsClone, node: "pc-windows" }, ""),
		).toBe("pc-windows");
	});

	it("finds the node owning an unpinned clone", () => {
		expect(resolveSelectedNode(repos, { cwd: windowsClone }, "")).toBe(
			"pc-windows",
		);
		expect(resolveSelectedNode(repos, { cwd: "/git/app" }, "pc-windows")).toBe(
			"",
		);
	});

	it("treats an unknown cwd as local", () => {
		expect(resolveSelectedNode(repos, { cwd: "/tmp/new" }, "pc-windows")).toBe(
			"",
		);
	});
});
