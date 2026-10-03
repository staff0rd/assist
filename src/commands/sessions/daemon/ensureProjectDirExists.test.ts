import { mkdirSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../../test/mocks/fsMock";
import { daemonLog } from "./daemonLog";
import { ensureProjectDirExists } from "./ensureProjectDirExists";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../../test/mocks/fsMock")
	).fsMock(),
);
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mkdirMock = vi.mocked(mkdirSync);
const mockLog = daemonLog as unknown as ReturnType<typeof vi.fn>;

describe("ensureProjectDirExists", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mkdirMock.mockImplementation(() => undefined);
	});

	it("creates the dir a fresh worktree does not have yet", () => {
		expect(ensureProjectDirExists("/projects/repo", "3")).toBe(true);
		expect(mkdirMock).toHaveBeenCalledWith("/projects/repo", {
			recursive: true,
		});
	});

	it("treats an existing dir as usable", () => {
		expect(ensureProjectDirExists("/projects/repo", "3")).toBe(true);
		expect(mockLog).not.toHaveBeenCalled();
	});

	it("reports the failure and refuses the dir when creation throws", () => {
		mkdirMock.mockImplementation(() => {
			throw new Error("EACCES");
		});

		expect(ensureProjectDirExists("/projects/repo", "3")).toBe(false);
		expect(mockLog).toHaveBeenCalledWith(
			"session 3 transcript dir unavailable: EACCES",
		);
	});
});
