import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import { readRepoConfigCache } from "../../shared/readRepoConfigCache";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { configImportRepos } from "./configImportRepos";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockPromptConfirm = vi.fn<() => Promise<boolean>>();

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: () => mockPromptConfirm(),
}));

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

const mockLoadGlobalConfigRaw = vi.mocked(loadGlobalConfigRaw);
const mockSaveGlobalConfig = vi.mocked(saveGlobalConfig);
let log: ReturnType<typeof vi.spyOn>;
const printed = () => log.mock.calls.flat().join("\n");

describe("configImportRepos", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		vi.clearAllMocks();
		log = vi.spyOn(console, "log").mockImplementation(() => undefined);
		mockLoadGlobalConfigRaw.mockReturnValue({
			commit: { push: true },
			repos: {
				assist: { worktree: { enabled: true }, commit: { pull: true } },
			},
		});
	});

	it("shows a per-key diff against the matching db override", async () => {
		await seedRepoConfigs(orm, {
			"github.com/org/assist": { commit: { pull: false } },
		});
		mockPromptConfirm.mockResolvedValue(false);

		await configImportRepos();

		expect(printed()).toContain("repos.assist → github.com/org/assist");
		expect(printed()).toContain("+ worktree.enabled: true");
		expect(printed()).toContain("~ commit.pull: false → true");
	});

	it("writes nothing when the user declines", async () => {
		mockPromptConfirm.mockResolvedValue(false);

		await configImportRepos();

		expect(await listRepoConfigs(orm)).toEqual({});
		expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
	});

	it("writes the merged keys, refreshes the cache and removes repos: on confirm", async () => {
		await seedRepoConfigs(orm, {
			"github.com/org/assist": { commit: { push: false } },
		});
		mockPromptConfirm.mockResolvedValue(true);

		await configImportRepos();

		const expected = {
			"github.com/org/assist": {
				commit: { push: false, pull: true },
				worktree: { enabled: true },
			},
		};
		expect(await listRepoConfigs(orm)).toEqual(expected);
		expect(readRepoConfigCache()).toEqual(expected);
		expect(mockSaveGlobalConfig.mock.lastCall?.[0]).toEqual({
			commit: { push: true },
		});
	});

	it("does nothing when the yml has no repos:", async () => {
		mockLoadGlobalConfigRaw.mockReturnValue({ commit: { push: true } });

		await configImportRepos();

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(printed()).toContain("No repos:");
	});

	it("rejects an invalid yml block before prompting", async () => {
		mockLoadGlobalConfigRaw.mockReturnValue({
			repos: { assist: { worktree: { enabled: "yes" } } },
		});
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		const exit = vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("exit");
		});

		await expect(configImportRepos()).rejects.toThrow("exit");

		expect(exit).toHaveBeenCalledWith(1);
		expect(mockPromptConfirm).not.toHaveBeenCalled();
	});
});
