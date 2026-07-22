import { beforeEach, describe, expect, it, vi } from "vitest";
import { configSet } from "./configSet";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockLoadGlobalConfigRaw = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();

const mockGetCurrentOrigin = vi.fn<() => string>();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => ({}),
	loadProjectConfig: () => mockLoadProjectConfig(),
	loadGlobalConfigRaw: () => mockLoadGlobalConfigRaw(),
	saveConfig: (c: unknown) => mockSaveConfig(c),
	saveGlobalConfig: (c: unknown) => mockSaveGlobalConfig(c),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => mockGetCurrentOrigin(),
}));
describe("configSet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
		mockGetCurrentOrigin.mockReturnValue("github.com/org/assist");
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

	describe("with --repo", () => {
		it("should write under the current repo's shortest label", () => {
			configSet("commit.push", "true", { repo: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { commit: { push: true } } },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should stack into an existing matching repos entry", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: { commit: { pull: true } } },
			});

			configSet("commit.push", "true", { repo: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { commit: { pull: true, push: true } } },
			});
		});

		it("should reuse an existing org/repo key over the bare label", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/assist": { commit: { pull: true } } },
			});

			configSet("commit.push", "true", { repo: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: {
					"org/assist": {
						commit: { pull: true, push: true },
					},
				},
			});
		});

		it("should preserve global-flat keys alongside the repos block", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				commit: { push: false },
			});

			configSet("commit.push", "true", { repo: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				commit: { push: false },
				repos: { assist: { commit: { push: true } } },
			});
		});

		it("should reject invalid keys before writing", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("bogus.key", "true", { repo: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});

		it("should reject combining --repo with --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("worktree.enabled", "true", { repo: true, global: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
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
