import { describe, expect, it, vi } from "vitest";
import { collectLeftovers } from "./collectLeftovers";

vi.mock("../daemon/worktree/leftoverReport", () => ({
	leftoverReport: () => ({
		nodeName: "wsl",
		leftovers: [{ path: "/git/repo-2", reason: "EACCES" }],
		command: "sudo rm -rf /git/repo-2",
	}),
}));

describe("collectLeftovers", () => {
	it("reports this node and each peer with leftovers, skipping peers that cannot answer or have none", async () => {
		const reports = await collectLeftovers(
			[
				{ name: "mac", url: "http://mac:3100" },
				{ name: "win", url: "http://win:3100" },
				{ name: "old", url: "http://old:3100" },
			],
			async (url) => {
				if (url.includes("old")) throw new Error("404");
				return url.includes("mac")
					? {
							nodeName: "mac",
							leftovers: [{ path: "/u/repo-3", reason: "review" }],
							command: "rm -rf /u/repo-3",
						}
					: { nodeName: "win", leftovers: [], command: null };
			},
		);

		expect(reports.map((r) => r.nodeName)).toEqual(["wsl", "mac"]);
	});
});
