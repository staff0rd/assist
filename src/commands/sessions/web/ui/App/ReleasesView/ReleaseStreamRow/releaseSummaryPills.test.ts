import { describe, expect, it } from "vitest";
import type {
	ReleaseNodeState,
	ReleaseRunNodeStatus,
	ReleaseStreamState,
} from "../../../../releases/types";
import { releaseSummaryPills } from "./releaseSummaryPills";

function node(
	id: string,
	overrides: Partial<ReleaseNodeState> = {},
): ReleaseNodeState {
	return {
		id,
		kind: "environment",
		environment: id,
		label: id,
		live: { sha: "aaa111", subject: null, author: null },
		deployedAt: "2026-09-18T00:00:00Z",
		behind: 0,
		queued: null,
		run: null,
		...overrides,
	};
}

function stream(nodes: ReleaseNodeState[]): ReleaseStreamState {
	return {
		name: "Web App",
		repo: "owner/name",
		workflow: "release.yml",
		defaultBranch: "main",
		head: null,
		nodes,
		edges: [],
		run: null,
	};
}

const runState = (status: ReleaseRunNodeStatus) => ({
	status,
	conclusion: null,
	startedAt: null,
	completedAt: null,
	url: null,
});

describe("releaseSummaryPills", () => {
	it("counts only environment nodes", () => {
		const pills = releaseSummaryPills(
			stream([
				node("build", { kind: "build", environment: null }),
				node("dev"),
			]),
			"live",
		);

		expect(pills[0]?.text).toBe("1 of 1 running the latest commit on main");
		expect(pills[0]?.ids).toEqual(["dev"]);
	});

	it("names the environments waiting on an approval", () => {
		const pills = releaseSummaryPills(
			stream([
				node("dev"),
				node("eu-prod", {
					behind: 10,
					queued: { sha: "bbb222", subject: null, author: null },
				}),
			]),
			"live",
		);

		expect(pills[1]).toEqual({
			tone: "gate",
			text: "1 waiting for someone to approve",
			ids: ["eu-prod"],
		});
	});

	it("reports the furthest drift", () => {
		const pills = releaseSummaryPills(
			stream([node("dev"), node("ap-prod", { behind: 9 })]),
			"live",
		);

		expect(pills[1]).toEqual({
			tone: "drift",
			text: "1 behind main, furthest by 9 commits",
			ids: ["ap-prod"],
		});
	});

	it("counts environments with no successful deployment", () => {
		const pills = releaseSummaryPills(
			stream([node("dev"), node("eu-prod", { live: null, behind: null })]),
			"live",
		);

		expect(pills.at(-1)).toEqual({
			tone: "idle",
			text: "1 with no successful deployment",
			ids: ["eu-prod"],
		});
	});

	it("counts what the latest run reached on the run layer", () => {
		const pills = releaseSummaryPills(
			stream([
				node("dev", { run: runState("ok") }),
				node("eu-prod", { run: runState("gate") }),
				node("ap-prod", { run: runState("idle") }),
			]),
			"run",
		);

		expect(pills.map((pill) => pill.text)).toEqual([
			"1 of 3 deployed by this run",
			"1 stopped at an approval gate",
			"1 this run never touched",
		]);
	});

	it("has nothing to say about a stream with no environments", () => {
		const pills = releaseSummaryPills(
			stream([node("build", { kind: "build", environment: null })]),
			"live",
		);

		expect(pills).toEqual([]);
	});
});
