import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();
const mockLoadConfig = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

vi.mock("./loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { pullIfConfigured } from "./pullIfConfigured";

describe("pullIfConfigured", () => {
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("does nothing when commit.pull is disabled", () => {
		mockLoadConfig.mockReturnValue({ commit: { pull: false } });

		pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("runs git pull --ff-only and proceeds on success", () => {
		mockLoadConfig.mockReturnValue({ commit: { pull: true } });
		mockExecSync.mockReturnValue("");

		pullIfConfigured();

		expect(mockExecSync).toHaveBeenCalledWith("git pull --ff-only", {
			stdio: "inherit",
		});
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("exits with code 1 when the pull fails", () => {
		mockLoadConfig.mockReturnValue({ commit: { pull: true } });
		mockExecSync.mockImplementation((command: string) => {
			if (command === "git status --porcelain") return "";
			throw new Error("pull failed");
		});

		expect(() => pullIfConfigured()).toThrow("process.exit");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});

	it("skips the pull when the working copy has local changes", () => {
		mockLoadConfig.mockReturnValue({ commit: { pull: true } });
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		mockExecSync.mockImplementation((command: string) =>
			command === "git status --porcelain" ? " M src/foo.ts\n" : "",
		);

		pullIfConfigured();

		expect(mockExecSync).not.toHaveBeenCalledWith("git pull --ff-only", {
			stdio: "inherit",
		});
		expect(warnSpy).toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();
	});
});
