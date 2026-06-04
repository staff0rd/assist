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

		pullIfConfigured();

		expect(mockExecSync).toHaveBeenCalledWith("git pull --ff-only", {
			stdio: "inherit",
		});
		expect(exitSpy).not.toHaveBeenCalled();
	});

	it("exits with code 1 when the pull fails", () => {
		mockLoadConfig.mockReturnValue({ commit: { pull: true } });
		mockExecSync.mockImplementation(() => {
			throw new Error("pull failed");
		});

		expect(() => pullIfConfigured()).toThrow("process.exit");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});
});
