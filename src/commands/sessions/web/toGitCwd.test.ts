import { afterEach, describe, expect, it, vi } from "vitest";
import { detectPlatform } from "../../../lib/detectPlatform";
import { toGitCwd } from "./toGitCwd";

vi.mock("../../../lib/detectPlatform", () => ({ detectPlatform: vi.fn() }));

const detectPlatformMock = detectPlatform as unknown as ReturnType<
	typeof vi.fn
>;

describe("toGitCwd", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("rewrites a Windows path to the /mnt mount under WSL", () => {
		detectPlatformMock.mockReturnValue("wsl");
		expect(toGitCwd(String.raw`C:\git\nextgen`)).toBe("/mnt/c/git/nextgen");
	});

	it("leaves a Windows path untouched when running natively on Windows", () => {
		detectPlatformMock.mockReturnValue("windows");
		expect(toGitCwd(String.raw`C:\git\nextgen`)).toBe(
			String.raw`C:\git\nextgen`,
		);
	});

	it("leaves POSIX paths untouched under WSL", () => {
		detectPlatformMock.mockReturnValue("wsl");
		expect(toGitCwd("/home/me/repo")).toBe("/home/me/repo");
	});
});
