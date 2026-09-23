import { describe, expect, it } from "vitest";
import type { ReleaseNodeState } from "../releases/types";
import { releaseEdgePromoted } from "./releaseEdgePromoted";

function node(
	id: string,
	overrides: Partial<ReleaseNodeState> = {},
): ReleaseNodeState {
	return {
		id,
		kind: "environment",
		environment: id,
		label: id,
		live: null,
		deployedAt: null,
		behind: null,
		queued: null,
		run: null,
		...overrides,
	};
}

const commit = (sha: string) => ({ sha, subject: null, author: null });

function graph(...nodes: ReleaseNodeState[]) {
	return new Map(nodes.map((n) => [n.id, n]));
}

describe("releaseEdgePromoted", () => {
	it("is promoted when the target carries the source's commit", () => {
		const nodes = graph(
			node("dev", { live: commit("aaa111") }),
			node("staging", { live: commit("aaa111") }),
		);

		expect(releaseEdgePromoted(nodes, "live", "dev", "staging")).toBe(true);
	});

	it("is not promoted when the target carries an older commit", () => {
		const nodes = graph(
			node("dev", { live: commit("aaa111") }),
			node("staging", { live: commit("old000") }),
		);

		expect(releaseEdgePromoted(nodes, "live", "dev", "staging")).toBe(false);
	});

	it("reads a build node's edge against the target's drift", () => {
		const nodes = graph(
			node("build", { kind: "build", environment: null }),
			node("dev", { live: commit("aaa111"), behind: 0 }),
		);

		expect(releaseEdgePromoted(nodes, "live", "build", "dev")).toBe(true);
	});

	it("leaves an edge into a build or gate node unpromoted", () => {
		const nodes = graph(
			node("staging", { live: commit("aaa111") }),
			node("promote", { kind: "gate", environment: null }),
		);

		expect(releaseEdgePromoted(nodes, "live", "staging", "promote")).toBe(
			false,
		);
	});

	it("follows the run's own job state on the run layer", () => {
		const done = {
			status: "ok" as const,
			conclusion: "success",
			startedAt: null,
			completedAt: null,
			url: null,
		};
		const nodes = graph(
			node("staging", { live: commit("aaa111") }),
			node("promote", { kind: "gate", environment: null, run: done }),
		);

		expect(releaseEdgePromoted(nodes, "run", "staging", "promote")).toBe(true);
	});

	it("is not promoted when either end is missing", () => {
		expect(releaseEdgePromoted(graph(node("dev")), "live", "dev", "gone")).toBe(
			false,
		);
	});
});
