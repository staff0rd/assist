import { execSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import { detectPlatform } from "./detectPlatform";
import { openBrowser } from "./openBrowser";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("./detectPlatform", () => ({ detectPlatform: vi.fn() }));

const execSyncMock = vi.mocked(execSync);
const detectPlatformMock = detectPlatform as unknown as ReturnType<
	typeof vi.fn
>;

describe("openBrowser", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.clearAllMocks();
		logSpy.mockRestore();
	});

	it("opens via xdg-open under WSL", () => {
		detectPlatformMock.mockReturnValue("wsl");

		openBrowser("http://localhost:3000");

		expect(execSyncMock).toHaveBeenCalledWith(
			`xdg-open "http://localhost:3000"`,
			{
				stdio: "ignore",
				windowsHide: true,
			},
		);
		expect(logSpy).not.toHaveBeenCalled();
	});

	it("prints the URL when no browser command succeeds", () => {
		detectPlatformMock.mockReturnValue("linux");
		execSyncMock.mockImplementation(() => {
			throw new Error("not found");
		});

		openBrowser("http://localhost:3000");

		expect(logSpy).toHaveBeenCalledWith(
			expect.stringContaining("http://localhost:3000"),
		);
	});

	it("stops at the first command that succeeds", () => {
		detectPlatformMock.mockReturnValue("macos");
		execSyncMock.mockImplementation(() => Buffer.from(""));

		openBrowser("http://localhost:3000");

		expect(execSyncMock).toHaveBeenCalledTimes(1);
		expect(logSpy).not.toHaveBeenCalled();
	});
});
