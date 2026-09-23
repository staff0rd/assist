import { describe, expect, it } from "vitest";
import type { ReleaseNode } from "../../../../shared/types";
import { matchRunJobs } from "./matchRunJobs";
import type { ReleaseRunJob } from "./runJobs";

function job(
	name: string,
	overrides: Partial<ReleaseRunJob> = {},
): ReleaseRunJob {
	return {
		name,
		status: "completed",
		conclusion: "success",
		startedAt: "2026-09-22T00:00:00Z",
		completedAt: "2026-09-22T00:01:37Z",
		url: `https://github.com/owner/name/jobs/${name}`,
		...overrides,
	};
}

const nodes: ReleaseNode[] = [
	{ id: "build", kind: "build" },
	{ id: "staging", environment: "Staging" },
	{ id: "eu-staging", environment: "EU Staging" },
];

describe("matchRunJobs", () => {
	it("matches a node through the reusable workflow prefix in the job name", () => {
		const matched = matchRunJobs(nodes, [
			job("site_release / Build the bundle"),
			job("site_release / Deploy to Staging"),
			job("site_release / Deploy to EU Staging"),
		]);

		expect(matched.get("build")?.status).toBe("ok");
		expect(matched.get("staging")?.url).toContain("Deploy to Staging");
	});

	it("gives a job to the most specific node that names it", () => {
		const matched = matchRunJobs(nodes, [
			job("release / Deploy to Staging"),
			job("release / Deploy to EU Staging"),
		]);

		expect(matched.get("eu-staging")?.url).toContain("Deploy to EU Staging");
		expect(matched.get("staging")?.url).not.toContain("EU Staging");
	});

	it("reads a job waiting on an environment approval as a gate", () => {
		const matched = matchRunJobs(nodes, [
			job("Deploy to Staging", { status: "waiting", conclusion: null }),
		]);

		expect(matched.get("staging")?.status).toBe("gate");
	});

	it("reads a skipped job as one this run never reached", () => {
		const matched = matchRunJobs(nodes, [
			job("Deploy to Staging", { conclusion: "skipped" }),
		]);

		expect(matched.get("staging")?.status).toBe("idle");
	});

	it("reads a failed job as a failure", () => {
		const matched = matchRunJobs(nodes, [
			job("Deploy to Staging", { conclusion: "failure" }),
		]);

		expect(matched.get("staging")?.status).toBe("fail");
	});

	it("reads a running job as in progress", () => {
		const matched = matchRunJobs(nodes, [
			job("Deploy to Staging", { status: "in_progress", conclusion: null }),
		]);

		expect(matched.get("staging")?.status).toBe("running");
	});

	it("leaves a node the run never touched with no job", () => {
		const matched = matchRunJobs(nodes, [job("Build the bundle")]);

		expect(matched.get("eu-staging")).toEqual({
			status: "idle",
			conclusion: null,
			startedAt: null,
			completedAt: null,
			url: null,
		});
	});
});
