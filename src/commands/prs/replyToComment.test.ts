import { spawnSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { replyToComment } from "./replyToComment";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const spawnSyncMock = vi.mocked(spawnSync);

beforeEach(() => {
	spawnSyncMock.mockReset();
	spawnSyncMock.mockReturnValue({
		status: 0,
		stdout: "{}",
		stderr: "",
	} as ReturnType<typeof spawnSync>);
});

describe("replyToComment", () => {
	it("should pass the body as an argument, without a shell", () => {
		const body =
			'Renames `query_duckdb` to `query_data`; $(uname) $HOME "quoted"';

		replyToComment("owner", "repo", 7, 42, body);

		const [command, args, options] = spawnSyncMock.mock.calls[0];
		expect(command).toBe("gh");
		expect(args).toEqual([
			"api",
			"repos/owner/repo/pulls/7/comments",
			"-f",
			`body=${body}`,
			"-F",
			"in_reply_to=42",
		]);
		expect(options).not.toHaveProperty("shell", true);
	});

	it("should throw when gh fails", () => {
		spawnSyncMock.mockReturnValue({
			status: 1,
			stdout: "",
			stderr: "HTTP 404",
		} as ReturnType<typeof spawnSync>);

		expect(() => replyToComment("owner", "repo", 7, 42, "body")).toThrow(
			"HTTP 404",
		);
	});

	it("should rethrow a spawn error so a missing gh is detected", () => {
		spawnSyncMock.mockReturnValue({
			error: new Error("spawnSync gh ENOENT"),
		} as ReturnType<typeof spawnSync>);

		expect(() => replyToComment("owner", "repo", 7, 42, "body")).toThrow(
			"ENOENT",
		);
	});
});
