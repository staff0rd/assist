import { describe, expect, it } from "vitest";
import type { NodesState, SessionInfo } from "../types";
import { transferCandidates } from "./transferCandidates";

const nodes: NodesState = {
	local: "work-wsl",
	links: [
		{ name: "mac", url: "ws://mac", state: "connected" },
		{ name: "work-win", url: "ws://win", state: "disconnected" },
	],
};

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "7",
		name: "assist backlog run a1402",
		commandType: "assist",
		assistArgs: ["backlog", "run", "a1402"],
		status: "running",
		startedAt: 0,
		repoGroup: { origin: "github.com/x/assist", clone: "/git/assist" },
		...overrides,
	};
}

describe("transferCandidates", () => {
	it("lists connected linked nodes other than the session's own", () => {
		expect(transferCandidates(session(), nodes)).toEqual(["mac"]);
	});

	it("offers the local node for a session on a linked node", () => {
		expect(transferCandidates(session({ node: "mac" }), nodes)).toEqual([
			"work-wsl",
		]);
	});

	it("offers nothing for sessions that are not backlog runs", () => {
		expect(
			transferCandidates(session({ assistArgs: ["draft"] }), nodes),
		).toEqual([]);
		expect(
			transferCandidates(
				session({ commandType: "claude", assistArgs: undefined }),
				nodes,
			),
		).toEqual([]);
	});
});
