import { beforeEach, describe, expect, it, vi } from "vitest";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";
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

		it("should write alongside a legacy news key and preserve it", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				news: { feeds: ["https://example.com/feed"] },
			});
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("sessions.maxLive", "21764", { global: true });

			expect(mockExit).not.toHaveBeenCalled();
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				news: { feeds: ["https://example.com/feed"] },
				sessions: { maxLive: 21764 },
			});
			mockExit.mockRestore();
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

	describe("with -g --repo", () => {
		it("should write under the current repo's shortest label", () => {
			configSet("commit.push", "true", { repo: true, global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { commit: { push: true } } },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should stack into an existing matching repos entry", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: { commit: { pull: true } } },
			});

			configSet("commit.push", "true", { repo: true, global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { commit: { pull: true, push: true } } },
			});
		});

		it("should reuse an existing org/repo key over the bare label", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/assist": { commit: { pull: true } } },
			});

			configSet("commit.push", "true", { repo: true, global: true });

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

			configSet("commit.push", "true", { repo: true, global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				commit: { push: false },
				repos: { assist: { commit: { push: true } } },
			});
		});

		it("should reject invalid keys before writing", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("bogus.key", "true", { repo: true, global: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});

		it("should allow combining --repo with --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("worktree.enabled", "true", { repo: true, global: true });

			expect(mockExit).not.toHaveBeenCalled();
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { worktree: { enabled: true } } },
			});
			mockExit.mockRestore();
		});

		it("should reject --repo without --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("worktree.enabled", "true", { repo: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});

		it("should reject --repo <name> without --global", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/planner": {} },
			});
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("worktree.enabled", "true", { repo: "org/planner" });

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});
	});

	describe("with -g --repo <name>", () => {
		it("should write under a named repo's matching block", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/planner": { commit: { push: true } } },
			});

			configSet("commit.push", "true", { repo: "org/planner", global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { "org/planner": { commit: { push: true } } },
			});
		});

		it("should not derive the target from the current origin", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { "org/planner": {} },
			});

			configSet("commit.push", "true", { repo: "org/planner", global: true });

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
				configSet("commit.push", "true", { repo: "planner", global: true }),
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
				configSet("commit.push", "true", {
					repo: "github.com/org/planner",
					global: true,
				}),
			).toThrow(AmbiguousRepoConfigError);
		});
	});

	describe("-g --repo optional-value greediness", () => {
		it("should treat a captured key as bare -g --repo targeting the cwd origin", () => {
			configSet("true", undefined, { repo: "commit.push", global: true });

			expect(mockGetCurrentOrigin).toHaveBeenCalled();
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { commit: { push: true } } },
			});
		});
	});

	describe("typed values", () => {
		it("should write an array-of-scalars key from comma-separated input", () => {
			configSet("worktree.copy", ".env,.claude/settings.local.json", {
				global: true,
			});

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				worktree: { copy: [".env", ".claude/settings.local.json"] },
			});
		});

		it("should trim whitespace around list items", () => {
			configSet("voice.wakeWords", "hey claude, ok claude", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				voice: { wakeWords: ["hey claude", "ok claude"] },
			});
		});

		it("should write an array key under -g --repo", () => {
			configSet("worktree.copy", ".env,.env.local", {
				global: true,
				repo: true,
			});

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				repos: { assist: { worktree: { copy: [".env", ".env.local"] } } },
			});
		});

		it("should write a number key as a number", () => {
			configSet("sessions.maxLive", "51764", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				sessions: { maxLive: 51764 },
			});
		});

		it("should keep string keys as strings", () => {
			configSet("branch.prefix", "sw", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				branch: { prefix: "sw" },
			});
		});

		it("should keep enum keys as strings", () => {
			configSet("sessions.linkVersionCheck", "warn", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				sessions: { linkVersionCheck: "warn" },
			});
		});

		it("should write nothing when a value cannot be coerced", () => {
			const mockExit = vi.spyOn(process, "exit").mockImplementation((() => {
				throw new Error("exit");
			}) as never);

			expect(() =>
				configSet("sessions.maxLive", "abc", { global: true }),
			).toThrow("exit");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});
	});

	describe("secrets", () => {
		it("should mask the value in the confirmation it prints", () => {
			const mockLog = vi
				.spyOn(console, "log")
				.mockImplementation(() => undefined);

			configSet("database.url", "postgres://user:hunter2@host/db", {
				global: true,
			});

			const printed = mockLog.mock.calls.flat().join("\n");
			expect(printed).toContain(SECRET_MASK);
			expect(printed).not.toContain("hunter2");
			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				database: { url: "postgres://user:hunter2@host/db" },
			});
			mockLog.mockRestore();
		});

		it("should keep the rejected value out of the error it prints", () => {
			const mockError = vi
				.spyOn(console, "error")
				.mockImplementation(() => undefined);
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configSet("roam.clientSecret", "hunter2", { global: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockError.mock.calls.flat().join("\n")).not.toContain("hunter2");
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			mockError.mockRestore();
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
