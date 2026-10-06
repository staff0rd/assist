import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import {
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { readRepoConfigCache } from "../../shared/readRepoConfigCache";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { writeConfigKeys } from "./writeConfigKeys";

const mockLoadProjectConfig = vi.mocked(loadProjectConfig);
const mockSaveConfig = vi.mocked(saveConfig);
const mockSaveGlobalConfig = vi.mocked(saveGlobalConfig);

let orm: Db;

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/org/assist",
}));

describe("writeConfigKeys", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
	});

	it("writes every key to the project config in one save", async () => {
		const result = await writeConfigKeys(
			[
				{ key: "review.highLevel.criticalPaths", value: ["**/*.graphql"] },
				{ key: "review.highLevel.descriptionWordCap", value: 250 },
			],
			"project",
		);

		expect(result).toEqual({ ok: true, target: "project assist.yml" });
		expect(mockSaveConfig).toHaveBeenCalledTimes(1);
		expect(mockSaveConfig).toHaveBeenCalledWith(
			{
				review: {
					highLevel: {
						criticalPaths: ["**/*.graphql"],
						descriptionWordCap: 250,
					},
				},
			},
			expect.any(String),
		);
	});

	it("preserves the keys the project config already has", async () => {
		mockLoadProjectConfig.mockReturnValue({ commit: { push: true } });

		await writeConfigKeys(
			[{ key: "review.highLevel.uiPaths", value: ["src/ui/**"] }],
			"project",
		);

		expect(mockSaveConfig).toHaveBeenCalledWith(
			{
				commit: { push: true },
				review: { highLevel: { uiPaths: ["src/ui/**"] } },
			},
			expect.any(String),
		);
	});

	it("merges into the current repo's shared db override and refreshes the cache", async () => {
		await seedRepoConfigs(orm, { assist: { worktree: { enabled: true } } });

		const result = await writeConfigKeys(
			[{ key: "review.highLevel.uiPaths", value: ["src/ui/**"] }],
			"repo",
		);

		expect(result).toEqual({
			ok: true,
			target: "the shared db, repo: assist",
		});
		const expected = {
			assist: {
				worktree: { enabled: true },
				review: { highLevel: { uiPaths: ["src/ui/**"] } },
			},
		};
		expect(await listRepoConfigs(orm)).toEqual(expected);
		expect(readRepoConfigCache()).toEqual(expected);
		expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("keys a new repo override by the full origin", async () => {
		await writeConfigKeys(
			[{ key: "review.highLevel.uiPaths", value: ["src/ui/**"] }],
			"repo",
		);

		expect(Object.keys(await listRepoConfigs(orm))).toEqual([
			"github.com/org/assist",
		]);
	});

	it("saves nothing when any value fails validation", async () => {
		const result = await writeConfigKeys(
			[
				{ key: "review.highLevel.criticalPaths", value: ["**/*.graphql"] },
				{ key: "review.highLevel.descriptionWordCap", value: -1 },
			],
			"project",
		);

		expect(result.ok).toBe(false);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("refuses a global-only key", async () => {
		const result = await writeConfigKeys(
			[{ key: "sync.autoConfirm", value: true }],
			"project",
		);

		expect(result).toEqual({
			ok: false,
			errors: [
				`"sync.autoConfirm" is a global-only key. Set it with 'assist config set sync.autoConfirm <value> -g'`,
			],
		});
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});
});
