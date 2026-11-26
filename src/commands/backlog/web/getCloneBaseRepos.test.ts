import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({ clone: { baseDir: "/git" } }),
}));

vi.mock("./listCloneBaseRepos", () => ({
	listCloneBaseRepos: () => [
		{ name: "app", cwd: "/git/app" },
		{ name: "loose", cwd: "/git/loose" },
	],
}));

vi.mock("../../sessions/daemon/originForCwd", () => ({
	originForCwd: (cwd: string) =>
		cwd === "/git/app" ? "github.com/org/app" : `local:${cwd}`,
}));

import { getCloneBaseRepos } from "./getCloneBaseRepos";

describe("getCloneBaseRepos", () => {
	it("returns each repo with its normalised origin", () => {
		getCloneBaseRepos({} as IncomingMessage, {} as ServerResponse);
		expect(mockRespondJson.mock.lastCall?.slice(1)).toEqual([
			200,
			{
				repos: [
					{ name: "app", cwd: "/git/app", origin: "github.com/org/app" },
					{ name: "loose", cwd: "/git/loose", origin: "local:/git/loose" },
				],
			},
		]);
	});
});
