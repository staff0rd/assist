import { execFile } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const execFileMock = vi.mocked(execFile);

import { GhImageUnavailableError, runGhImage } from "./runGhImage";

type Cb = (err: unknown, out?: { stdout: string; stderr: string }) => void;

function mockExecFile(
	impl: (f: string, a: string[], o: unknown, cb: Cb) => void,
): void {
	execFileMock.mockImplementation(impl as never);
}

describe("runGhImage", () => {
	it("returns the first non-empty markdown line from gh image", async () => {
		mockExecFile((_f: string, _a: string[], _o: unknown, cb: Cb) =>
			cb(null, { stdout: "\n![shot](https://x/y.png)\n", stderr: "" }),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).resolves.toBe(
			"![shot](https://x/y.png)",
		);
	});

	it("picks the image-reference line past any progress output", async () => {
		mockExecFile((_f: string, _a: string[], _o: unknown, cb: Cb) =>
			cb(null, {
				stdout: "Uploading shot.png…\n![shot](https://x/y.png)\nDone\n",
				stderr: "",
			}),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).resolves.toBe(
			"![shot](https://x/y.png)",
		);
	});

	it("picks the bare asset URL for a video upload", async () => {
		mockExecFile((_f: string, _a: string[], _o: unknown, cb: Cb) =>
			cb(null, {
				stdout:
					"Uploading clip.mp4 to https://uploads.github.com…\nhttps://github.com/user-attachments/assets/9f1c-4a2b\n",
				stderr: "",
			}),
		);
		await expect(runGhImage("/tmp/a.mp4", "/repo")).resolves.toBe(
			"https://github.com/user-attachments/assets/9f1c-4a2b",
		);
	});

	it("flags a missing gh binary as unavailable", async () => {
		mockExecFile((_f: string, _a: string[], _o: unknown, cb: Cb) =>
			cb(Object.assign(new Error("spawn gh ENOENT"), { code: "ENOENT" })),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).rejects.toBeInstanceOf(
			GhImageUnavailableError,
		);
	});

	it("flags a missing gh-image extension as unavailable", async () => {
		mockExecFile((_f: string, _a: string[], _o: unknown, cb: Cb) =>
			cb(
				Object.assign(new Error("failed"), {
					stderr: 'unknown command "image" for "gh"',
				}),
			),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).rejects.toBeInstanceOf(
			GhImageUnavailableError,
		);
	});

	it("surfaces other gh failures as plain errors", async () => {
		mockExecFile((_f: string, _a: string[], _o: unknown, cb: Cb) =>
			cb(Object.assign(new Error("boom"), { stderr: "auth required" })),
		);
		const err = await runGhImage("/tmp/a.png", "/repo").catch((error) => error);
		expect(err).toBeInstanceOf(Error);
		expect(err).not.toBeInstanceOf(GhImageUnavailableError);
		expect(String(err)).toContain("auth required");
	});
});
