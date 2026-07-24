import { describe, expect, it, vi } from "vitest";

const execFileMock = vi.fn();
vi.mock("node:child_process", () => ({
	execFile: (...args: unknown[]) => execFileMock(...args),
}));

import { GhImageUnavailableError, runGhImage } from "./runGhImage";

type Cb = (err: unknown, out?: { stdout: string; stderr: string }) => void;

describe("runGhImage", () => {
	it("returns the first non-empty markdown line from gh image", async () => {
		execFileMock.mockImplementation(
			(_f: string, _a: string[], _o: unknown, cb: Cb) =>
				cb(null, { stdout: "\n![shot](https://x/y.png)\n", stderr: "" }),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).resolves.toBe(
			"![shot](https://x/y.png)",
		);
	});

	it("picks the image-reference line past any progress output", async () => {
		execFileMock.mockImplementation(
			(_f: string, _a: string[], _o: unknown, cb: Cb) =>
				cb(null, {
					stdout: "Uploading shot.png…\n![shot](https://x/y.png)\nDone\n",
					stderr: "",
				}),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).resolves.toBe(
			"![shot](https://x/y.png)",
		);
	});

	it("flags a missing gh binary as unavailable", async () => {
		execFileMock.mockImplementation(
			(_f: string, _a: string[], _o: unknown, cb: Cb) =>
				cb(Object.assign(new Error("spawn gh ENOENT"), { code: "ENOENT" })),
		);
		await expect(runGhImage("/tmp/a.png", "/repo")).rejects.toBeInstanceOf(
			GhImageUnavailableError,
		);
	});

	it("flags a missing gh-image extension as unavailable", async () => {
		execFileMock.mockImplementation(
			(_f: string, _a: string[], _o: unknown, cb: Cb) =>
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
		execFileMock.mockImplementation(
			(_f: string, _a: string[], _o: unknown, cb: Cb) =>
				cb(Object.assign(new Error("boom"), { stderr: "auth required" })),
		);
		const err = await runGhImage("/tmp/a.png", "/repo").catch((error) => error);
		expect(err).toBeInstanceOf(Error);
		expect(err).not.toBeInstanceOf(GhImageUnavailableError);
		expect(String(err)).toContain("auth required");
	});
});
