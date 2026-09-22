import { beforeEach, describe, expect, it, vi } from "vitest";
import { ghJson } from "./ghJson";
import { liveDeployments } from "./liveDeployments";

vi.mock("./ghJson", () => ({ ghJson: vi.fn() }));

const ghJsonMock = vi.mocked(ghJson);

type Deployment = {
	environment: string;
	createdAt: string;
	commitOid: string;
	latestStatus: { state: string; createdAt: string } | null;
};

function withDeployments(nodes: Deployment[], defaultBranch = "main"): void {
	ghJsonMock.mockResolvedValue({
		data: {
			repository: {
				defaultBranchRef: { name: defaultBranch },
				deployments: { nodes },
			},
		},
	} as never);
}

function deployment(overrides: Partial<Deployment> = {}): Deployment {
	return {
		environment: "prod",
		createdAt: "2026-09-18T00:00:00Z",
		commitOid: "aaa111",
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
			sha: "new222",
			at: "2026-09-19T00:00:00Z",
		});
	});

	it("treats a waiting deployment as not live", async () => {
		withDeployments([
			deployment({ commitOid: "live111" }),
			deployment({
				commitOid: "gated222",
				latestStatus: { state: "WAITING", createdAt: "2026-09-19T00:00:00Z" },
			}),
		]);

		const { live } = await liveDeployments("/repo", "owner/name", ["prod"]);

		expect(live.get("prod")?.sha).toBe("live111");
	});

	it("reports the repository's default branch", async () => {
		withDeployments([], "trunk");

		const { defaultBranch } = await liveDeployments("/repo", "owner/name", []);

		expect(defaultBranch).toBe("trunk");
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
