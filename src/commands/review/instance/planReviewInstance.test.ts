import { describe, expect, it } from "vitest";
import { allocateServicePorts } from "./allocateServicePorts";
import { buildInstanceEnv } from "./buildInstanceEnv";
import { instanceEntryUrl } from "./instanceEntryUrl";
import { instanceProjectName } from "./instanceProjectName";
import { planReviewInstance } from "./planReviewInstance";

function portSequence(...ports: number[]) {
	let index = 0;
	return () => Promise.resolve(ports[index++] as number);
}

describe("instanceProjectName", () => {
	it("slugs the repo and appends the PR and suffix", () => {
		expect(instanceProjectName("My_Repo.web", 42, "abc123")).toBe(
			"assist-review-my-repo-web-pr42-abc123",
		);
	});

	it("is unique per run of the same PR", () => {
		expect(instanceProjectName("app", 1)).not.toBe(
			instanceProjectName("app", 1),
		);
	});
});

describe("allocateServicePorts", () => {
	it("allocates distinct ports only for services with a port", async () => {
		const ports = await allocateServicePorts(
			{ web: { port: 3000 }, worker: {}, api: { port: 8080 } },
			portSequence(5001, 5001, 5002),
		);
		expect(ports).toEqual({ web: 5001, api: 5002 });
	});
});

describe("buildInstanceEnv", () => {
	it("passes the checkout to every service and ports to those that have one", () => {
		expect(
			buildInstanceEnv({ web: { port: 3000 }, "bg-worker": {} }, "/tmp/tree", {
				web: 5001,
			}),
		).toEqual({
			ASSIST_SRC_WEB: "/tmp/tree",
			ASSIST_PORT_WEB: "5001",
			ASSIST_SRC_BG_WORKER: "/tmp/tree",
		});
	});
});

describe("instanceEntryUrl", () => {
	it("joins the entry service's host port and path", () => {
		expect(
			instanceEntryUrl({ service: "web", path: "app" }, { web: 5001 }),
		).toBe("http://localhost:5001/app");
	});

	it("rejects an entry service without a port", () => {
		expect(() =>
			instanceEntryUrl({ service: "worker", path: "/" }, { web: 5001 }),
		).toThrow(/review.instance.services.worker.port/);
	});
});

describe("planReviewInstance", () => {
	it("places the worktree under the project name and resolves the compose file", async () => {
		const plan = await planReviewInstance({
			config: {
				composeFile: "docker-compose.review.yml",
				services: { web: { port: 3000 } },
				entry: { service: "web", path: "/" },
				logs: { services: {}, browser: { ignore: [] } },
			},
			repoRoot: "/repo",
			repo: "app",
			prNumber: 7,
			instancesDir: "/instances",
			nextPort: portSequence(6000),
		});
		expect(plan.project).toMatch(/^assist-review-app-pr7-[0-9a-f]{6}$/);
		expect(plan.worktree).toBe(`/instances/${plan.project}`);
		expect(plan.composeFile).toBe("/repo/docker-compose.review.yml");
		expect(plan.env).toEqual({
			ASSIST_SRC_WEB: plan.worktree,
			ASSIST_PORT_WEB: "6000",
		});
		expect(plan.url).toBe("http://localhost:6000/");
	});
});
