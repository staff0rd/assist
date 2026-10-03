import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { configUnset } from "./configUnset";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadProjectConfig = vi.mocked(loadProjectConfig);
const mockLoadGlobalConfigRaw = vi.mocked(loadGlobalConfigRaw);
const mockSaveConfig = vi.mocked(saveConfig);
const mockSaveGlobalConfig = vi.mocked(saveGlobalConfig);

const mockGetCurrentOrigin = vi.fn<() => string>();

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => mockGetCurrentOrigin(),
}));

describe("configUnset", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
		mockGetCurrentOrigin.mockReturnValue("github.com/org/assist");
	});

	describe("without --global", () => {
		it("should remove the key from the project config", () => {
			mockLoadProjectConfig.mockReturnValue({
				commit: { push: true, pull: true },
			});

			configUnset("commit.push");

			expect(mockSaveConfig.mock.lastCall?.[0]).toEqual({
				commit: { pull: true },
			});
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should prune the parent left empty", () => {
			mockLoadProjectConfig.mockReturnValue({ worktree: { enabled: true } });

			configUnset("worktree.enabled");

			expect(mockSaveConfig.mock.lastCall?.[0]).toEqual({});
		});

		it("should preserve unrelated keys", () => {
			mockLoadProjectConfig.mockReturnValue({
				worktree: { enabled: true },
				commit: { push: true },
			});

			configUnset("worktree.enabled");

			expect(mockSaveConfig.mock.lastCall?.[0]).toEqual({
				commit: { push: true },
			});
		});
	});

	describe("with --global", () => {
		it("should remove the key from the global config", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				sync: { autoConfirm: true },
				commit: { push: true },
			});

			configUnset("sync.autoConfirm", { global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				commit: { push: true },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should remove the key alongside a legacy news key and preserve it", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				news: { feeds: ["https://example.com/feed"] },
				sync: { autoConfirm: true },
			});
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configUnset("sync.autoConfirm", { global: true });

			expect(mockExit).not.toHaveBeenCalled();
			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				news: { feeds: ["https://example.com/feed"] },
			});
			mockExit.mockRestore();
		});
	});

	describe("with -g --repo", () => {
		it("should remove only the key from the current repo's block", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				commit: { push: false },
				repos: { assist: { commit: { push: true, pull: true } } },
			});

			configUnset("commit.push", { repo: true, global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				commit: { push: false },
				repos: { assist: { commit: { pull: true } } },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should prune a block left empty and drop an empty repos map", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: { commit: { push: true } } },
			});

			configUnset("commit.push", { repo: true, global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({});
		});

		it("should keep sibling repo blocks when one is pruned", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: {
					assist: { commit: { push: true } },
					other: { commit: { push: false } },
				},
			});

			configUnset("commit.push", { repo: true, global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				repos: { other: { commit: { push: false } } },
			});
		});

		it("should target a named repo block", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: {
					assist: { commit: { push: true } },
					other: { commit: { push: false, pull: true } },
				},
			});

			configUnset("commit.push", { repo: "other", global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				repos: {
					assist: { commit: { push: true } },
					other: { commit: { pull: true } },
				},
			});
		});

		it("should accept the key as the --repo argument", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: { commit: { push: true, pull: true } } },
			});

			configUnset(undefined, { repo: "commit.push", global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				repos: { assist: { commit: { pull: true } } },
			});
		});

		it("should report nothing to clear without writing", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: { commit: { push: true } } },
			});
			const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

			configUnset("worktree.enabled", { repo: true, global: true });

			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			expect(log.mock.calls[0][0]).toContain("not set in repos.assist");
			log.mockRestore();
		});

		it("should reject --repo without --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);
			vi.spyOn(console, "error").mockImplementation(() => undefined);

			configUnset("commit.push", { repo: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});

		it("should reject a global-only key", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);
			vi.spyOn(console, "error").mockImplementation(() => undefined);

			configUnset("sync.autoConfirm", { repo: true, global: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});
	});

	describe("global-only keys", () => {
		it("should reject sync.autoConfirm without --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configUnset("sync.autoConfirm");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});
	});

	describe("when the result fails validation", () => {
		it("should exit non-zero without writing", () => {
			mockLoadProjectConfig.mockReturnValue({
				roam: { clientId: "id", clientSecret: "secret" },
			});
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configUnset("roam.clientId");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});
	});

	describe("when the key is absent", () => {
		it("should not write the config", () => {
			mockLoadProjectConfig.mockReturnValue({ commit: { push: true } });

			configUnset("worktree.enabled");

			expect(mockSaveConfig).not.toHaveBeenCalled();
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should report which layer was checked", () => {
			const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

			configUnset("worktree.enabled");

			expect(log.mock.calls[0][0]).toContain("not set in the project config");
			log.mockRestore();
		});
	});
});
