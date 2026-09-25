import { describe, expect, it } from "vitest";
import type { ReleaseNodeState } from "../../../../../../../../../releases/types";
import { releaseNodeState } from "./releaseNodeState";

function node(overrides: Partial<ReleaseNodeState> = {}): ReleaseNodeState {
	return {
		id: "eu-prod",
		kind: "environment",
		environment: "EU Production",
		label: "eu-prod",
		live: { sha: "3b9c0a1ee", subject: "feat: a thing", author: "Sam" },
		deployedAt: "2026-09-18T00:00:00Z",
		behind: 0,
		queued: null,
		run: null,
		...overrides,
	};
}

describe("releaseNodeState", () => {
	it("reads an environment on the tip of the default branch as current", () => {
		const state = releaseNodeState(node(), "main");
		expect(state.tone).toBe("ok");
		expect(state.tooltip).toBe("Running the latest commit on main");
	});

	it("reads an environment behind the default branch as drift", () => {
		const state = releaseNodeState(node({ behind: 9 }), "main");
		expect(state.tone).toBe("drift");
		expect(state.tooltip).toBe(
			"Behind main by 9 commits, and nothing is queued to fix it",
		);
	});

	it("reads an environment with a commit awaiting approval as gated", () => {
		const state = releaseNodeState(
			node({
				behind: 10,
				queued: { sha: "bbb222", subject: null, author: null },
			}),
			"main",
		);
		expect(state.tone).toBe("gate");
		expect(state.tooltip).toBe(
			"Behind main by 10 commits, with a newer commit waiting for approval",
		);
	});

	it("singularises a one commit gap", () => {
		expect(releaseNodeState(node({ behind: 1 }), "main").tooltip).toBe(
			"Behind main by 1 commit, and nothing is queued to fix it",
		);
	});

	it("reads an environment with no successful deployment as idle", () => {
		const state = releaseNodeState(
			node({ live: null, deployedAt: null, behind: null }),
			"main",
		);
		expect(state.tone).toBe("idle");
		expect(state.tooltip).toBe(
			"No successful deployment recorded for this environment",
		);
	});

	it("says so when the distance from the default branch is unknown", () => {
		const state = releaseNodeState(node({ behind: null }), "main");
		expect(state.tone).toBe("idle");
		expect(state.tooltip).toBe(
			"Live, but its distance from main could not be read",
		);
	});

	it("explains a gate node as a step rather than an environment", () => {
		const state = releaseNodeState(
			node({ kind: "gate", environment: null, live: null, behind: null }),
			"main",
		);
		expect(state.tooltip).toBe(
			"An approval step, not a deployable environment",
		);
	});

	it("explains a build node as a step rather than an environment", () => {
		const state = releaseNodeState(
			node({ kind: "build", environment: null, live: null, behind: null }),
			"main",
		);
		expect(state.tooltip).toBe("A build step, not a deployable environment");
	});
});
