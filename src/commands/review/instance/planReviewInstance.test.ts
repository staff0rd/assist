import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { allocateServicePorts } from "./allocateServicePorts";
import { buildInstanceEnv } from "./buildInstanceEnv";
import { instanceEntryUrl } from "./instanceEntryUrl";
import { instanceProjectName } from "./instanceProjectName";
import { planReviewInstance } from "./planReviewInstance";
import type { InstanceCheckout } from "./checkouts/InstanceCheckout";

const checkout: InstanceCheckout = {
	repo: "acme/app",
	repoRoot: "/repo",
	dir: "/tmp/tree",
	sha: "abc",
	fetchRef: "pull/1/head",
	source: "PR #1",
	services: [],
};

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

	it("uses a fixed hostPort and keeps it out of the free ports", async () => {
		const ports = await allocateServicePorts(
			{ web: { port: 5173, hostPort: 5173 }, api: { port: 4000 } },
			portSequence(5173, 6001),
		);
		expect(ports).toEqual({ web: 5173, api: 6001 });
	});
});

describe("buildInstanceEnv", () => {
	it("passes each service its checkout and ports to those that have one", () => {
		expect(
			buildInstanceEnv(
				[
					{ ...checkout, dir: "/tmp/tree", services: ["api", "bg-worker"] },
					{ ...checkout, dir: "/tmp/front", services: ["web"] },
				],
				{ api: 5001 },
			),
		).toEqual({
			ASSIST_SRC_API: "/tmp/tree",
			ASSIST_PORT_API: "5001",
			ASSIST_SRC_BG_WORKER: "/tmp/tree",
			ASSIST_SRC_WEB: "/tmp/front",
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

const pr = {
	repo: "app",
	fullName: "acme/app",
	number: 7,
	sha: "a".repeat(40),
	body: "",
};

describe("planReviewInstance", () => {
	it("expands a leading ~/ in the compose file to the home directory", async () => {
		const plan = await planReviewInstance({
			config: {
				composeFile: "~/compose/app.review.yml",
				services: { web: { port: 3000 } },
				entry: { service: "web", path: "/" },
				logs: { services: {}, browser: { ignore: [] } },
			},
			repoRoot: "/repo",
			pr,
			instancesDir: "/instances",
			nextPort: portSequence(6000),
		});
		expect(plan.composeFile).toBe(join(homedir(), "compose/app.review.yml"));
	});

	it("places the worktree under the project name and resolves the compose file", async () => {
		const plan = await planReviewInstance({
			config: {
				composeFile: "docker-compose.review.yml",
				services: { web: { port: 3000 } },
				entry: { service: "web", path: "/" },
				logs: { services: {}, browser: { ignore: [] } },
			},
			repoRoot: "/repo",
			pr,
			instancesDir: "/instances",
			nextPort: portSequence(6000),
		});
		expect(plan.project).toMatch(/^assist-review-app-pr7-[0-9a-f]{6}$/);
		const worktree = `/instances/${plan.project}`;
		expect(plan.checkouts).toEqual([
			{
				repo: "acme/app",
				repoRoot: "/repo",
				dir: worktree,
				sha: pr.sha,
				fetchRef: "pull/7/head",
				source: "PR #7",
				services: ["web"],
			},
		]);
		expect(plan.composeFile).toBe("/repo/docker-compose.review.yml");
		expect(plan.env).toEqual({
			ASSIST_SRC_WEB: worktree,
			ASSIST_PORT_WEB: "6000",
		});
		expect(plan.url).toBe("http://localhost:6000/");
	});
});
