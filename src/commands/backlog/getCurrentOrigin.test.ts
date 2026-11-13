import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("../../shared/findRepoRoot", () => ({
	findRepoRoot: vi.fn((dir: string) => dir),
}));

import { findRepoRoot } from "../../shared/findRepoRoot";
import { normalizeOrigin, resolveCurrentOrigin } from "./getCurrentOrigin";

const mockExecFileSync = vi.mocked(execFileSync);

afterEach(() => {
	mockExecFileSync.mockReset();
});

describe("normalizeOrigin", () => {
	it("canonicalises ssh (scp-like) and https forms to the same key", () => {
		const ssh = normalizeOrigin("git@github.com:Org/Repo.git");
		const https = normalizeOrigin("https://github.com/Org/Repo.git");
		expect(ssh).toBe("github.com/Org/Repo");
		expect(https).toBe("github.com/Org/Repo");
		expect(ssh).toBe(https);
	});

	it("strips a trailing .git", () => {
		expect(normalizeOrigin("https://github.com/org/repo.git")).toBe(
			"github.com/org/repo",
		);
		expect(normalizeOrigin("https://github.com/org/repo")).toBe(
			"github.com/org/repo",
		);
	});

	it("lowercases the host but preserves path case", () => {
		expect(normalizeOrigin("https://GitHub.com/Org/Repo")).toBe(
			"github.com/Org/Repo",
		);
	});

	it("drops userinfo and port", () => {
		expect(normalizeOrigin("ssh://git@github.com:22/org/repo.git")).toBe(
			"github.com/org/repo",
		);
		expect(normalizeOrigin("https://user:pass@gitlab.com/group/sub/repo")).toBe(
			"gitlab.com/group/sub/repo",
		);
	});

	it("strips trailing slashes", () => {
		expect(normalizeOrigin("https://github.com/org/repo/")).toBe(
			"github.com/org/repo",
		);
	});

	it("is idempotent for an already-normalized key", () => {
		expect(normalizeOrigin("github.com/org/repo")).toBe("github.com/org/repo");
	});
});

function respond(replies: Record<string, string | Error>): void {
	mockExecFileSync.mockImplementation((_file, argv) => {
		const key = (argv ?? []).join(" ");
		const reply = replies[key];
		if (reply === undefined) throw new Error(`unexpected git ${key}`);
		if (reply instanceof Error) throw reply;
		return reply;
	});
}

describe("resolveCurrentOrigin", () => {
	it("reports a remote-derived origin as stable", () => {
		respond({ "remote get-url origin": "git@github.com:org/repo.git\n" });

		expect(resolveCurrentOrigin("/git/repo")).toEqual({
			origin: "github.com/org/repo",
			stable: true,
		});
	});

	it("falls back to any other remote when there is no origin", () => {
		respond({
			"remote get-url origin": new Error("no such remote"),
			remote: "upstream\n",
			"remote get-url upstream": "https://github.com/org/repo\n",
		});

		expect(resolveCurrentOrigin("/git/repo")).toEqual({
			origin: "github.com/org/repo",
			stable: true,
		});
	});

	it("reports a remote-less repo's local key as stable", () => {
		respond({
			"remote get-url origin": new Error("no such remote"),
			remote: "",
			"rev-parse --show-toplevel": "/git/bare\n",
		});

		expect(resolveCurrentOrigin("/git/bare")).toEqual({
			origin: "local:/git/bare",
			stable: true,
		});
	});

	it("reports the local key as unstable when listing remotes fails", () => {
		respond({
			"remote get-url origin": new Error("could not read"),
			remote: new Error("could not read"),
			"rev-parse --show-toplevel": "/git/flaky\n",
		});

		expect(resolveCurrentOrigin("/git/flaky")).toEqual({
			origin: "local:/git/flaky",
			stable: false,
		});
	});

	it("resolves a directory outside any repo without running git", () => {
		vi.mocked(findRepoRoot).mockReturnValueOnce(null);

		expect(resolveCurrentOrigin("/home/me")).toEqual({
			origin: "local:/home/me",
			stable: false,
		});
		expect(mockExecFileSync).not.toHaveBeenCalled();
	});

	describe("given a Windows path", () => {
		const onPlatform = (platform: NodeJS.Platform) =>
			vi.spyOn(process, "platform", "get").mockReturnValue(platform);

		afterEach(() => {
			vi.mocked(findRepoRoot).mockImplementation((dir: string) => dir);
			vi.restoreAllMocks();
		});

		const outsideRepo = String.raw`C:\Users\me`;
		const insideRepo = String.raw`C:\git\repo`;
		const originOf = (dir: string) => ({
			[`-C ${dir} remote get-url origin`]: "https://github.com/org/repo.git\n",
		});

		it("resolves a directory outside any repo without running git on Windows", () => {
			onPlatform("win32");
			vi.mocked(findRepoRoot).mockReturnValue(null);

			expect(resolveCurrentOrigin(outsideRepo)).toEqual({
				origin: `local:${outsideRepo}`,
				stable: false,
			});
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});

		it("asks git on Windows when the directory is inside a repo", () => {
			onPlatform("win32");
			respond(originOf(insideRepo));

			expect(resolveCurrentOrigin(insideRepo)).toEqual({
				origin: "github.com/org/repo",
				stable: true,
			});
		});

		it("asks git from WSL, where the path cannot be read directly", () => {
			onPlatform("linux");
			vi.mocked(findRepoRoot).mockReturnValue(null);
			respond(originOf(insideRepo));

			expect(resolveCurrentOrigin(insideRepo)).toEqual({
				origin: "github.com/org/repo",
				stable: true,
			});
		});
	});

	it("reports the local key as unstable when a listed remote's url cannot be read", () => {
		respond({
			"remote get-url origin": new Error("could not read"),
			remote: "upstream\n",
			"remote get-url upstream": new Error("could not read"),
			"rev-parse --show-toplevel": "/git/flaky\n",
		});

		expect(resolveCurrentOrigin("/git/flaky")).toEqual({
			origin: "local:/git/flaky",
			stable: false,
		});
	});
});
