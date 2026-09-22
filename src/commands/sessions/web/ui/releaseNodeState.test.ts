import { describe, expect, it } from "vitest";
import type { ReleaseEnvironmentState } from "../releases/types";
import { releaseNodeState } from "./releaseNodeState";

function environment(
	overrides: Partial<ReleaseEnvironmentState> = {},
): ReleaseEnvironmentState {
	return {
		id: "uk-prod",
		environment: "UK Production",
		label: "uk-prod",
		sha: "fd6d1e2aa",
		deployedAt: "2026-09-18T00:00:00Z",
		behind: 0,
		...overrides,
	};
}

describe("releaseNodeState", () => {
	it("reads an environment on the tip of the default branch as current", () => {
		const state = releaseNodeState(environment(), "main");
		expect(state.tone).toBe("ok");
		expect(state.tooltip).toBe("Running the latest commit on main");
	});

	it("reads an environment behind the default branch as drift", () => {
		const state = releaseNodeState(environment({ behind: 46 }), "main");
		expect(state.tone).toBe("drift");
		expect(state.tooltip).toBe("Behind main by 46 commits");
	});

	it("singularises a one commit gap", () => {
		expect(releaseNodeState(environment({ behind: 1 }), "main").tooltip).toBe(
			"Behind main by 1 commit",
		);
	});

	it("reads an environment with no successful deployment as idle", () => {
		const state = releaseNodeState(
			environment({ sha: null, deployedAt: null, behind: null }),
			"main",
		);
		expect(state.tone).toBe("idle");
		expect(state.tooltip).toBe(
			"No successful deployment recorded for this environment",
		);
	});

	it("says so when the distance from the default branch is unknown", () => {
		const state = releaseNodeState(environment({ behind: null }), "main");
		expect(state.tone).toBe("idle");
		expect(state.tooltip).toBe(
			"Live, but its distance from main could not be read",
		);
	});
});
