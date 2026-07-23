import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnknownRepoConfigError } from "../../shared/resolveNamedRepoWriteLabel";
import { AmbiguousRepoConfigError } from "../../shared/resolveRepoOverride";
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

	describe("with --repo <name>", () => {
		it("should write under a named repo's matching block", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/planner": { commit: { push: true } } },
			});

			configSet("commit.push", "true", { repo: "org/planner" });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { "org/planner": { commit: { push: true } } },
			});
		});

		it("should not derive the target from the current origin", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/planner": {} },
			});

			configSet("commit.push", "true", { repo: "org/planner" });

			expect(mockGetCurrentOrigin).not.toHaveBeenCalled();
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { "org/planner": { commit: { push: true } } },
			});
		});

		it("should error when the name matches no known repo", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: {} },
			});

			expect(() =>
				configSet("commit.push", "true", { repo: "planner" }),
			).toThrow(UnknownRepoConfigError);
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should error when the name matches multiple repos", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: {
					planner: {},
					"org/planner": {},
				},
			});

			expect(() =>
				configSet("commit.push", "true", { repo: "github.com/org/planner" }),
			).toThrow(AmbiguousRepoConfigError);
		});
	});

	describe("--repo optional-value greediness", () => {
		it("should treat a captured key as bare --repo targeting the cwd origin", () => {
			configSet("true", undefined, { repo: "commit.push" });

			expect(mockGetCurrentOrigin).toHaveBeenCalled();
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { commit: { push: true } } },
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
