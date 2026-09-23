import { beforeEach, describe, expect, it, vi } from "vitest";
import { ghJson } from "./ghJson";
import { liveDeployments } from "./liveDeployments";

vi.mock("./ghJson", () => ({ ghJson: vi.fn() }));

const ghJsonMock = vi.mocked(ghJson);

type Deployment = {
	environment: string;
	createdAt: string;
	commitOid: string;
	commit: { messageHeadline: string; author: { name: string } } | null;
	latestStatus: { state: string; createdAt: string } | null;
};

function withEnvironmentDeployments(
	perEnvironment: Deployment[][],
	defaultBranch = "main",
): void {
	ghJsonMock.mockResolvedValue({
		data: {
			repository: {
				defaultBranchRef: {
					name: defaultBranch,
					target: {
						oid: "head999",
						messageHeadline: "fix: the tip",
						author: { name: "Robin" },
					},
				},
				...Object.fromEntries(
					perEnvironment.map((nodes, index) => [`env${index}`, { nodes }]),
				),
			},
		},
	} as never);
}

function withDeployments(nodes: Deployment[], defaultBranch = "main"): void {
	withEnvironmentDeployments([nodes], defaultBranch);
}

function queryArg(): string {
	const args = ghJsonMock.mock.calls[0]?.[1] ?? [];
	return args.find((arg) => arg.startsWith("query=")) ?? "";
}

function deployment(overrides: Partial<Deployment> = {}): Deployment {
	return {
		environment: "prod",
		createdAt: "2026-09-18T00:00:00Z",
		commitOid: "aaa111",
		commit: { messageHeadline: "feat: a thing", author: { name: "Sam" } },
		latestStatus: { state: "SUCCESS", createdAt: "2026-09-18T00:05:00Z" },
		...overrides,
	};
}

beforeEach(() => {
	ghJsonMock.mockReset();
});

describe("liveDeployments", () => {
	it("takes the newest successful deployment per environment", async () => {
		withDeployments([
			deployment({ commitOid: "old111" }),
			deployment({
				commitOid: "new222",
				latestStatus: { state: "SUCCESS", createdAt: "2026-09-19T00:00:00Z" },
			}),
		]);

		const { live } = await liveDeployments("/repo", "owner/name", ["prod"]);

		expect(live.get("prod")).toEqual({
			commit: { sha: "new222", subject: "feat: a thing", author: "Sam" },
			at: "2026-09-19T00:00:00Z",
		});
	});

	it("treats a waiting deployment as queued rather than live", async () => {
		withDeployments([
			deployment({ commitOid: "live111" }),
			deployment({
				commitOid: "gated222",
				latestStatus: { state: "WAITING", createdAt: "2026-09-19T00:00:00Z" },
			}),
		]);

		const { live, queued } = await liveDeployments("/repo", "owner/name", [
			"prod",
		]);

		expect(live.get("prod")?.commit.sha).toBe("live111");
		expect(queued.get("prod")?.commit.sha).toBe("gated222");
	});

	it("drops a queued commit once it deploys successfully", async () => {
		withDeployments([
			deployment({
				commitOid: "next222",
				latestStatus: { state: "WAITING", createdAt: "2026-09-19T00:00:00Z" },
			}),
			deployment({
				commitOid: "next222",
				latestStatus: { state: "SUCCESS", createdAt: "2026-09-19T01:00:00Z" },
			}),
		]);

		const { live, queued } = await liveDeployments("/repo", "owner/name", [
			"prod",
		]);

		expect(live.get("prod")?.commit.sha).toBe("next222");
		expect(queued.has("prod")).toBe(false);
	});

	it("reads each environment through its own deployments window", async () => {
		withEnvironmentDeployments([
			[deployment({ environment: "dev", commitOid: "dev111" })],
			[deployment({ environment: "prod", commitOid: "prod222" })],
		]);

		const { live } = await liveDeployments("/repo", "owner/name", [
			"dev",
			"prod",
			"dev",
		]);

		expect(queryArg()).toContain('env0: deployments(environments:["dev"]');
		expect(queryArg()).toContain('env1: deployments(environments:["prod"]');
		expect(queryArg()).not.toContain("env2:");
		expect(live.get("dev")?.commit.sha).toBe("dev111");
		expect(live.get("prod")?.commit.sha).toBe("prod222");
	});

	it("reports the repository's default branch and its head commit", async () => {
		withDeployments([], "trunk");

		const { defaultBranch, head } = await liveDeployments(
			"/repo",
			"owner/name",
			[],
		);

		expect(defaultBranch).toBe("trunk");
		expect(head).toEqual({
			sha: "head999",
			subject: "fix: the tip",
			author: "Robin",
		});
	});

	it("rejects a repo that is not owner/name", async () => {
		await expect(liveDeployments("/repo", "name", [])).rejects.toThrow(
			"Not an owner/name repo: name",
		);
	});

	it("rejects a repository the API would not return", async () => {
		ghJsonMock.mockResolvedValue({ data: { repository: null } } as never);

		await expect(liveDeployments("/repo", "owner/name", [])).rejects.toThrow(
			"Repository not readable: owner/name",
		);
	});
});
