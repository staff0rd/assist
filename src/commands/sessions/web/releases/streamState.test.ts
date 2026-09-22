import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReleaseStream } from "../../../../shared/types";
import { commitsBehind } from "./commitsBehind";
import { liveDeployments } from "./liveDeployments";
import { streamRunState } from "./streamRunState";
import { streamState } from "./streamState";

vi.mock("./liveDeployments", () => ({ liveDeployments: vi.fn() }));
vi.mock("./commitsBehind", () => ({ commitsBehind: vi.fn() }));
vi.mock("./streamRunState", () => ({ streamRunState: vi.fn() }));

const liveDeploymentsMock = vi.mocked(liveDeployments);
const commitsBehindMock = vi.mocked(commitsBehind);
const streamRunStateMock = vi.mocked(streamRunState);

const stream: ReleaseStream = {
	name: "Web App",
	repo: "owner/name",
	workflow: "release.yml",
	nodes: [
		{ id: "build", kind: "build" },
		{ id: "dev", environment: "dev" },
		{ id: "promote", kind: "gate" },
		{ id: "uk-prod", environment: "UK Production", label: "uk-prod" },
	],
	edges: [
		["build", "dev"],
		["dev", "promote"],
		["promote", "uk-prod"],
	],
};

const devCommit = { sha: "aaa111", subject: "feat: a thing", author: "Sam" };

beforeEach(() => {
	liveDeploymentsMock.mockReset();
	commitsBehindMock.mockReset();
	streamRunStateMock.mockReset();
	commitsBehindMock.mockResolvedValue(3);
	streamRunStateMock.mockResolvedValue({ run: null, byNode: new Map() });
	liveDeploymentsMock.mockResolvedValue({
		defaultBranch: "main",
		head: { sha: "head999", subject: "chore: tip", author: "Robin" },
		live: new Map([["dev", { commit: devCommit, at: "2026-09-22T00:57:32Z" }]]),
		queued: new Map(),
	});
});

describe("streamState", () => {
	it("carries every declared node, build and gate included", async () => {
		const state = await streamState("/repo", stream);

		expect(state.nodes.map((node) => [node.id, node.kind])).toEqual([
			["build", "build"],
			["dev", "environment"],
			["promote", "gate"],
			["uk-prod", "environment"],
		]);
	});

	it("carries the stream's edges", async () => {
		const state = await streamState("/repo", stream);

		expect(state.edges).toEqual(stream.edges);
	});

	it("reports each environment's live commit, age and drift", async () => {
		const state = await streamState("/repo", stream);

		expect(state.defaultBranch).toBe("main");
		expect(state.nodes[1]).toEqual({
			id: "dev",
			kind: "environment",
			environment: "dev",
			label: "dev",
			live: devCommit,
			deployedAt: "2026-09-22T00:57:32Z",
			behind: 3,
			queued: null,
			run: null,
		});
	});

	it("leaves a build node with no live state of its own", async () => {
		const state = await streamState("/repo", stream);

		expect(state.nodes[0]).toMatchObject({
			id: "build",
			environment: null,
			live: null,
			behind: null,
			queued: null,
		});
	});

	it("reports a queued commit awaiting approval", async () => {
		const gated = { sha: "bbb222", subject: "fix: next", author: "Alex" };
		liveDeploymentsMock.mockResolvedValue({
			defaultBranch: "main",
			head: null,
			live: new Map([
				["dev", { commit: devCommit, at: "2026-09-22T00:57:32Z" }],
			]),
			queued: new Map([["dev", { commit: gated, at: "2026-09-22T02:00:00Z" }]]),
		});

		const state = await streamState("/repo", stream);

		expect(state.nodes[1]?.queued).toEqual(gated);
	});

	it("attaches the latest run's job state to each node", async () => {
		streamRunStateMock.mockResolvedValue({
			run: {
				number: 670,
				url: "https://github.com/owner/name/actions/runs/1",
				headSha: "aaa111",
				status: "waiting",
				startedAt: "2026-09-22T00:00:00Z",
			},
			byNode: new Map([
				[
					"uk-prod",
					{
						status: "gate" as const,
						conclusion: null,
						startedAt: "2026-09-22T00:30:00Z",
						completedAt: null,
						url: null,
					},
				],
			]),
		});

		const state = await streamState("/repo", stream);

		expect(state.run?.number).toBe(670);
		expect(state.nodes[3]?.run?.status).toBe("gate");
		expect(state.nodes[0]?.run).toBeNull();
	});

	it("asks GitHub only for the environments the stream declares", async () => {
		await streamState("/repo", stream);

		expect(liveDeploymentsMock).toHaveBeenCalledWith("/repo", "owner/name", [
			"dev",
			"UK Production",
		]);
	});

	it("surfaces a stream whose repo cannot be read as an error row", async () => {
		liveDeploymentsMock.mockRejectedValue(
			new Error("gh: Not Found (HTTP 404)\ntrace id 1"),
		);

		const state = await streamState("/repo", stream);

		expect(state.error).toBe("gh: Not Found (HTTP 404)");
		expect(state.nodes).toEqual([]);
	});

	it("surfaces a stream whose workflow cannot be read as an error row", async () => {
		streamRunStateMock.mockRejectedValue(
			new Error("gh: Not Found (HTTP 404)\ntrace id 2"),
		);

		const state = await streamState("/repo", stream);

		expect(state.error).toBe("gh: Not Found (HTTP 404)");
		expect(state.nodes).toEqual([]);
	});
});
