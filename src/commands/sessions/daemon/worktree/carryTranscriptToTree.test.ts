import { copyFileSync, existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../../test/mocks/fsMock";
import { findTranscriptPathSync } from "../../shared/findTranscriptPathSync";
import { carryTranscriptToTree } from "./carryTranscriptToTree";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../shared/findTranscriptPathSync", () => ({
	projectDirForCwd: (cwd: string) => `/projects${cwd.replace(/\//g, "-")}`,
	findTranscriptPathSync: vi.fn(),
}));

const findMock = vi.mocked(findTranscriptPathSync);
const copyMock = vi.mocked(copyFileSync);
const existsMock = vi.mocked(existsSync);

describe("carryTranscriptToTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsMock.mockReturnValue(false);
		findMock.mockReturnValue("/projects-git-repo-7/abc12345.jsonl");
	});

	it("copies the transcript into the target tree's project dir", () => {
		carryTranscriptToTree("abc12345", "/git/repo-7", "/git/repo-3");

		expect(copyMock).toHaveBeenCalledWith(
			"/projects-git-repo-7/abc12345.jsonl",
			"/projects-git-repo-3/abc12345.jsonl",
		);
	});

	it("copies nothing when the tree kept its original path", () => {
		carryTranscriptToTree("abc12345", "/git/repo-7", "/git/repo-7");

		expect(findMock).not.toHaveBeenCalled();
		expect(copyMock).not.toHaveBeenCalled();
	});

	it("leaves a transcript already in the target untouched", () => {
		existsMock.mockReturnValue(true);

		carryTranscriptToTree("abc12345", "/git/repo-7", "/git/repo-3");

		expect(copyMock).not.toHaveBeenCalled();
	});

	it("resumes anyway when the original transcript is gone", () => {
		findMock.mockReturnValue(null);

		expect(() =>
			carryTranscriptToTree("abc12345", "/git/repo-7", "/git/repo-3"),
		).not.toThrow();
		expect(copyMock).not.toHaveBeenCalled();
	});

	it("resumes anyway when the copy fails", () => {
		copyMock.mockImplementation(() => {
			throw new Error("EACCES");
		});

		expect(() =>
			carryTranscriptToTree("abc12345", "/git/repo-7", "/git/repo-3"),
		).not.toThrow();
	});
});
