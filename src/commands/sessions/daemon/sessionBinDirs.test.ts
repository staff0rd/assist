import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RepoNode } from "../../../shared/nodeRuntime/repoNode";
import { sessionBinDirs } from "./sessionBinDirs";

const log = vi.hoisted(() => vi.fn());
vi.mock("./daemonLog", () => ({ daemonLog: log }));

const pin = { file: "/repo/.node-version", spec: "24" };

function deps(repo: RepoNode | undefined, harness?: string) {
	return { repo: () => repo, harness: () => harness };
}

describe("sessionBinDirs", () => {
	beforeEach(() => log.mockClear());

	it("puts the repo's pinned node ahead of the harness bin", () => {
		const repo: RepoNode = {
			pin,
			ok: true,
			node: { path: "/n24/bin/node", binDir: "/n24/bin", version: "24.1.0" },
		};
		expect(sessionBinDirs("/repo", "1", deps(repo, "/n22/bin"))).toEqual([
			"/n24/bin",
			"/n22/bin",
		]);
		expect(log).not.toHaveBeenCalled();
	});

	it("keeps today's path for a repo with no pin", () => {
		expect(sessionBinDirs("/repo", "1", deps(undefined))).toEqual([]);
		expect(sessionBinDirs("/repo", "1", deps(undefined, "/n22/bin"))).toEqual([
			"/n22/bin",
		]);
	});

	it("logs the wanted version and carries on when nothing satisfies it", () => {
		const repo: RepoNode = { pin, ok: false, error: "none installed" };
		expect(sessionBinDirs("/repo", "7", deps(repo, "/n22/bin"))).toEqual([
			"/n22/bin",
		]);
		expect(log).toHaveBeenCalledWith(
			expect.stringContaining(
				'session 7 in /repo: /repo/.node-version wants node "24" but none installed',
			),
		);
	});

	it("skips repo resolution without a cwd", () => {
		const repo = vi.fn();
		expect(
			sessionBinDirs(undefined, "1", { repo, harness: () => undefined }),
		).toEqual([]);
		expect(repo).not.toHaveBeenCalled();
	});
});
