import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockLoadGlobalConfigRaw = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => ({}),
	loadProjectConfig: () => mockLoadProjectConfig(),
	loadGlobalConfigRaw: () => mockLoadGlobalConfigRaw(),
	saveConfig: (c: unknown) => mockSaveConfig(c),
	saveGlobalConfig: (c: unknown) => mockSaveGlobalConfig(c),
}));

import { configSet } from ".";

describe("configSet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
	});

	describe("without --global", () => {
		it("should write to project config", () => {
			configSet("commit.push", "true");

			expect(mockLoadProjectConfig).toHaveBeenCalled();
			expect(mockSaveConfig).toHaveBeenCalledWith({ commit: { push: true } });
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should preserve existing project config keys", () => {
			mockLoadProjectConfig.mockReturnValue({ commit: { pull: true } });

			configSet("commit.push", "true");

			expect(mockSaveConfig).toHaveBeenCalledWith({
				commit: { pull: true, push: true },
			});
		});
	});

	describe("with --global", () => {
		it("should write to global config", () => {
			configSet("sync.autoConfirm", "true", { global: true });

			expect(mockLoadGlobalConfigRaw).toHaveBeenCalled();
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				sync: { autoConfirm: true },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should preserve existing global config keys", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				commit: { conventional: true },
			});

			configSet("sync.autoConfirm", "true", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				commit: { conventional: true },
				sync: { autoConfirm: true },
			});
		});
	});

	describe("global-only keys", () => {
		it("should reject sync.autoConfirm without --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("sync.autoConfirm", "true");

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});

		it("should allow sync.autoConfirm with --global", () => {
			configSet("sync.autoConfirm", "true", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				sync: { autoConfirm: true },
			});
		});
	});

	describe("validation", () => {
		it("should reject invalid keys", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("bogus.key", "true");

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});
	});
});
