import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReleaseStream } from "../../../../shared/types";
import { commitsBehind } from "./commitsBehind";
import { liveDeployments } from "./liveDeployments";
import { streamState } from "./streamState";

vi.mock("./liveDeployments", () => ({ liveDeployments: vi.fn() }));
vi.mock("./commitsBehind", () => ({ commitsBehind: vi.fn() }));

const liveDeploymentsMock = vi.mocked(liveDeployments);
const commitsBehindMock = vi.mocked(commitsBehind);

const stream: ReleaseStream = {
	name: "Web App",
	repo: "owner/name",
	workflow: "release.yml",
	nodes: [
		{ id: "build", kind: "build" },
		{ id: "dev", environment: "dev" },
		{ id: "uk-prod", environment: "UK Production", label: "uk-prod" },
	],
	edges: [["build", "dev"]],
};

beforeEach(() => {
	liveDeploymentsMock.mockReset();
	commitsBehindMock.mockReset();
	commitsBehindMock.mockResolvedValue(3);
});

describe("streamState", () => {
	it("reports one entry per environment node, skipping build and gate nodes", async () => {
		liveDeploymentsMock.mockResolvedValue({
			defaultBranch: "main",
			live: new Map([["dev", { sha: "aaa111", at: "2026-09-22T00:57:32Z" }]]),
		});

		const state = await streamState("/repo", stream);

		expect(state.defaultBranch).toBe("main");
		expect(state.environments).toEqual([
			{
				id: "dev",
				environment: "dev",
				label: "dev",
				sha: "aaa111",
				deployedAt: "2026-09-22T00:57:32Z",
				behind: 3,
			},
			{
				id: "uk-prod",
				environment: "UK Production",
				label: "uk-prod",
				sha: null,
				deployedAt: null,
				behind: null,
			},
		]);
	});

	it("asks GitHub only for the environments the stream declares", async () => {
		liveDeploymentsMock.mockResolvedValue({
			defaultBranch: "main",
			live: new Map(),
		});

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
		expect(state.environments).toEqual([]);
	});
});
