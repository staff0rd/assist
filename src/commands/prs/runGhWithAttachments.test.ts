import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const removeStagedAttachmentsMock = vi.fn();
vi.mock("../../shared/removeStagedAttachments", () => ({
	removeStagedAttachments: (...args: unknown[]) =>
		removeStagedAttachmentsMock(...args),
}));

import { runGhWithAttachments } from "./runGhWithAttachments";

const mockExecFileSync = vi.mocked(execFileSync);
const ATTACHMENTS = [
	{ path: "/s/u1/a.png", alt: "a" },
	{ path: "/s/u2/b.mp4", alt: "b" },
];

function ghFails(stdout: string, stderr: string) {
	mockExecFileSync.mockImplementation(() => {
		throw Object.assign(new Error("gh failed"), { stdout, stderr, status: 1 });
	});
}

let errors: string[];

beforeEach(() => {
	vi.clearAllMocks();
	mockExecFileSync.mockReset();
	errors = [];
	vi.spyOn(console, "error").mockImplementation((m: string) => {
		errors.push(m);
	});
	vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	vi.spyOn(process, "exit").mockImplementation(() => {
		throw new Error("process.exit");
	});
});

describe("runGhWithAttachments", () => {
	it("returns gh's output and removes the staged files on success", () => {
		mockExecFileSync.mockReturnValue("https://github.com/o/r/pull/1\n");

		expect(runGhWithAttachments(["pr", "create"], ATTACHMENTS)).toBe(
			"https://github.com/o/r/pull/1\n",
		);
		expect(mockExecFileSync).toHaveBeenCalledWith("gh", ["pr", "create"], {
			encoding: "utf8",
			stdio: ["inherit", "pipe", "pipe"],
		});
		expect(removeStagedAttachmentsMock).toHaveBeenCalledWith(ATTACHMENTS);
	});

	it("names the minimum gh version when gh does not know --attach", () => {
		ghFails("", "unknown flag: --attach\n\nUsage: gh pr create [flags]");

		expect(() => runGhWithAttachments(["pr", "create"], ATTACHMENTS)).toThrow(
			"process.exit",
		);
		expect(errors.join("\n")).toContain("2.99.0 or later");
	});

	it("keeps a PR gh placed despite a failed attachment and names the failure", () => {
		ghFails(
			"https://github.com/o/r/pull/7\n",
			"failed to upload /s/u2/b.mp4: 413",
		);

		expect(runGhWithAttachments(["pr", "create"], ATTACHMENTS)).toBe(
			"https://github.com/o/r/pull/7\n",
		);
		const report = errors.join("\n");
		expect(report).toContain("/s/u2/b.mp4");
		expect(report).not.toContain("/s/u1/a.png");
		expect(removeStagedAttachmentsMock).not.toHaveBeenCalled();
	});

	it("exits when gh placed nothing", () => {
		ghFails("", "failed to upload /s/u1/a.png");

		expect(() => runGhWithAttachments(["pr", "create"], ATTACHMENTS)).toThrow(
			"process.exit",
		);
		expect(removeStagedAttachmentsMock).not.toHaveBeenCalled();
	});
});
