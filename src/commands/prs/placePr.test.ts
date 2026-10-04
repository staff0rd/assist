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

const recordPrActivityMock = vi.fn();
vi.mock("./recordPrActivity", () => ({
	recordPrActivity: () => recordPrActivityMock(),
}));
vi.mock("../../shared/removeStagedAttachments", () => ({
	removeStagedAttachments: vi.fn(),
}));

import { placePr } from "./placePr";

const mockExecFileSync = vi.mocked(execFileSync);

beforeEach(() => {
	vi.clearAllMocks();
	mockExecFileSync.mockReset();
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	vi.spyOn(process.stdout, "write").mockImplementation(() => true);
	vi.spyOn(process, "exit").mockImplementation(() => {
		throw new Error("process.exit");
	});
});

describe("placePr", () => {
	it("records the PR when gh placed it but an attachment failed", async () => {
		mockExecFileSync.mockImplementation(() => {
			throw Object.assign(new Error("gh failed"), {
				stdout: "https://github.com/o/r/pull/7\n",
				stderr: "failed to upload /s/u1/a.png",
				status: 1,
			});
		});

		await placePr(7, "t", "b", {}, [{ path: "/s/u1/a.png", alt: "a" }]);

		expect(process.stdout.write).toHaveBeenCalledWith(
			"https://github.com/o/r/pull/7\n",
		);
		expect(recordPrActivityMock).toHaveBeenCalled();
	});
});
