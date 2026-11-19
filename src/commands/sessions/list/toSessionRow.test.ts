import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../daemon/createSession";
import { formatSessionRows } from "./formatSessionRows";
import { toSessionRow } from "./toSessionRow";

function session(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "3",
		name: "Session 3",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		waitingSince: null,
		...overrides,
	} as SessionInfo;
}

const lookups = {
	agentNames: new Map([["conv-1", "assist-9-0c"]]),
	branchOf: () => "feat/x",
};

describe("toSessionRow", () => {
	it("maps a local agent session with its ListAgents name and branch", () => {
		const row = toSessionRow(
			session({
				title: "Add list",
				claudeSessionId: "conv-1",
				cwd: "/repo",
				repoGroup: { origin: "git@github.com:me/assist.git", clone: "/repo" },
			}),
			lookups,
		);
		expect(row).toEqual({
			id: "3",
			kind: "agent",
			status: "running",
			node: "local",
			repo: "assist",
			branch: "feat/x",
			title: "Add list",
			agentName: "assist-9-0c",
		});
	});

	it("keeps a linked session's node-prefixed id and skips local lookups", () => {
		const row = toSessionRow(
			session({
				id: "win:4",
				node: "win",
				commandType: "run",
				server: true,
				claudeSessionId: "conv-1",
				cwd: "/repo",
			}),
			lookups,
		);
		expect(row).toMatchObject({ id: "win:4", kind: "server", node: "win" });
		expect(row.branch).toBeUndefined();
		expect(row.agentName).toBeUndefined();
	});

	it("falls back to the generated title, then the name", () => {
		expect(
			toSessionRow(session({ generatedTitle: "Gen" }), lookups).title,
		).toBe("Gen");
		expect(
			toSessionRow(session({ commandType: "run" }), lookups),
		).toMatchObject({ kind: "run", title: "Session 3" });
	});
});

describe("formatSessionRows", () => {
	it("aligns columns and dashes missing values", () => {
		const lines = formatSessionRows([
			toSessionRow(session({ title: "A" }), lookups),
			toSessionRow(session({ id: "win:12", node: "win", title: "B" }), lookups),
		]);
		expect(lines).toEqual([
			"ID      KIND   STATUS   NODE   REPO/BRANCH  AGENT  TITLE",
			"3       agent  running  local  -            -      A",
			"win:12  agent  running  win    -            -      B",
		]);
	});
});
