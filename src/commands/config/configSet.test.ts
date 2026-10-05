import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import {
	type RepoConfigOverrides,
	readRepoConfigCache,
} from "../../shared/readRepoConfigCache";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";
import { UnknownRepoConfigError } from "../../shared/resolveNamedRepoWriteLabel";
import { AmbiguousRepoConfigError } from "../../shared/resolveRepoOverride";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { configSet } from "./configSet";

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

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

const ORIGIN = "github.com/org/assist";
const sharedRepos = () => listRepoConfigs(orm);
const seedRepos = (repos: RepoConfigOverrides) => seedRepoConfigs(orm, repos);

describe("configSet", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
		mockGetCurrentOrigin.mockReturnValue("github.com/org/assist");
	});

	describe("without --global", () => {
		it("should write to project config", () => {
			configSet("commit.push", "true");

			expect(mockLoadProjectConfig).toHaveBeenCalled();
			expect(mockSaveConfig.mock.lastCall?.[0]).toEqual({
				commit: { push: true },
			});
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should preserve existing project config keys", () => {
			mockLoadProjectConfig.mockReturnValue({ commit: { pull: true } });

			configSet("commit.push", "true");

			expect(mockSaveConfig.mock.lastCall?.[0]).toEqual({
				commit: { pull: true, push: true },
			});
		});
	});

	describe("with --global", () => {
		it("should write to global config", () => {
			configSet("sync.autoConfirm", "true", { global: true });

			expect(mockLoadGlobalConfigRaw).toHaveBeenCalled();
			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				sync: { autoConfirm: true },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should preserve existing global config keys", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				commit: { conventional: true },
			});

			configSet("sync.autoConfirm", "true", { global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
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
			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
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

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				sync: { autoConfirm: true },
			});
		});
	});

	describe("with -g --repo", () => {
		it("should write a new shared row keyed by the full origin", async () => {
			await configSet("commit.push", "true", { repo: true, global: true });

			expect(await sharedRepos()).toEqual({
				[ORIGIN]: { commit: { push: true } },
			});
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});

		it("should stack into an existing matching row", async () => {
			await seedRepos({ assist: { commit: { pull: true } } });

			await configSet("commit.push", "true", { repo: true, global: true });

			expect(await sharedRepos()).toEqual({
				assist: { commit: { pull: true, push: true } },
			});
		});

		it("should reuse an existing org/repo key", async () => {
			await seedRepos({ "org/assist": { commit: { pull: true } } });

			await configSet("commit.push", "true", { repo: true, global: true });

			expect(await sharedRepos()).toEqual({
				"org/assist": { commit: { pull: true, push: true } },
			});
		});

		it("should leave a yml repos entry untouched", async () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				repos: { assist: { commit: { pull: true } } },
			});

			await configSet("commit.push", "true", { repo: true, global: true });

			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			expect(await sharedRepos()).toEqual({
				[ORIGIN]: { commit: { push: true } },
			});
		});

		it("should refresh the local cache after writing", async () => {
			await configSet("worktree.enabled", "true", { repo: true, global: true });

			expect(readRepoConfigCache()).toEqual({
				[ORIGIN]: { worktree: { enabled: true } },
			});
		});

		it("should reject invalid keys before writing", async () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			await configSet("bogus.key", "true", { repo: true, global: true });

			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});

		it("should reject --repo without --global", async () => {
			const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("exit");
			});

			await expect(
				configSet("worktree.enabled", "true", { repo: true }),
			).rejects.toThrow("exit");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(await sharedRepos()).toEqual({});
			mockExit.mockRestore();
		});
	});

	describe("with -g --repo <name>", () => {
		it("should write under a named repo's matching row", async () => {
			await seedRepos({ "org/planner": { commit: { push: false } } });

			await configSet("commit.push", "true", {
				repo: "org/planner",
				global: true,
			});

			expect(await sharedRepos()).toEqual({
				"org/planner": { commit: { push: true } },
			});
			expect(mockGetCurrentOrigin).not.toHaveBeenCalled();
		});

		it("should error when the name matches no shared row", async () => {
			await seedRepos({ assist: { commit: { push: false } } });

			await expect(
				configSet("commit.push", "true", { repo: "planner", global: true }),
			).rejects.toThrow(UnknownRepoConfigError);
		});

		it("should error when the name matches multiple rows", async () => {
			await seedRepos({
				planner: { commit: { push: false } },
				"org/planner": { commit: { push: false } },
			});

			await expect(
				configSet("commit.push", "true", {
					repo: "github.com/org/planner",
					global: true,
				}),
			).rejects.toThrow(AmbiguousRepoConfigError);
		});
	});

	describe("-g --repo optional-value greediness", () => {
		it("should treat a captured key as bare -g --repo targeting the cwd origin", async () => {
			await configSet("true", undefined, {
				repo: "commit.push",
				global: true,
			});

			expect(mockGetCurrentOrigin).toHaveBeenCalled();
			expect(await sharedRepos()).toEqual({
				[ORIGIN]: { commit: { push: true } },
			});
		});
	});

	describe("typed values", () => {
		it("should write an array-of-scalars key from comma-separated input", () => {
			configSet("worktree.copy", ".env,.claude/settings.local.json", {
				global: true,
			});

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				worktree: { copy: [".env", ".claude/settings.local.json"] },
			});
		});

		it("should trim whitespace around list items", () => {
			configSet("complexity.ignore", "a.ts, b.ts", { global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				complexity: { ignore: ["a.ts", "b.ts"] },
			});
		});

		it("should write an array key under -g --repo", async () => {
			await configSet("worktree.copy", ".env,.env.local", {
				global: true,
				repo: true,
			});

			expect(await sharedRepos()).toEqual({
				[ORIGIN]: { worktree: { copy: [".env", ".env.local"] } },
			});
		});

		it("should write a number key as a number", () => {
			configSet("sessions.maxLive", "51764", { global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				sessions: { maxLive: 51764 },
			});
		});

		it("should keep string keys as strings", () => {
			configSet("branch.prefix", "sw", { global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				branch: { prefix: "sw" },
			});
		});

		it.each([
			["true", true],
			["false", false],
			["pnpm install", "pnpm install"],
			['[".","packages/ui"]', [".", "packages/ui"]],
		])(
			"should write worktree.install %s as its matching type",
			(raw, value) => {
				configSet("worktree.install", raw, { global: true });

				expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
					worktree: { install: value },
				});
			},
		);

		it("should keep enum keys as strings", () => {
			configSet("sessions.linkVersionCheck", "warn", { global: true });

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				sessions: { linkVersionCheck: "warn" },
			});
		});

		it("should write nothing when a value cannot be coerced", async () => {
			const mockExit = vi.spyOn(process, "exit").mockImplementation((() => {
				throw new Error("exit");
			}) as never);

			await expect(
				configSet("sessions.maxLive", "abc", { global: true }),
			).rejects.toThrow("exit");

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
			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
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

		it("should write a valid hotkey chord", () => {
			configSet("sessions.hotkeys.focusTerminal", "Ctrl+Alt+J", {
				global: true,
			});

			expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
				sessions: { hotkeys: { focusTerminal: "Ctrl+Alt+J" } },
			});
		});

		it.each([
			["sessions.hotkeys.focusTerminal", "Hyper+J"],
			["sessions.hotkeys.focusTerminal", "J"],
			["sessions.hotkeys.focusTerminal", "Alt+NotAKey"],
			["sessions.hotkeys.navTab", "Alt+1"],
		])("should reject the invalid chord %s=%s", async (key, value) => {
			const mockError = vi
				.spyOn(console, "error")
				.mockImplementation(() => undefined);
			const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("exit");
			});

			await expect(configSet(key, value, { global: true })).rejects.toThrow(
				"exit",
			);

			expect(mockError.mock.calls.flat().join("\n")).toContain(key);
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
			mockError.mockRestore();
			mockExit.mockRestore();
		});
	});
});
