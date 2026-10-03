import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { writeConfigKeys } from "./writeConfigKeys";

const mockLoadProjectConfig = vi.mocked(loadProjectConfig);
const mockLoadGlobalConfigRaw = vi.mocked(loadGlobalConfigRaw);
const mockSaveConfig = vi.mocked(saveConfig);
const mockSaveGlobalConfig = vi.mocked(saveGlobalConfig);
const mockGetCurrentOrigin = vi.fn<() => string>();

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => mockGetCurrentOrigin(),
}));

describe("writeConfigKeys", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
		mockGetCurrentOrigin.mockReturnValue("github.com/org/assist");
	});

	it("writes every key to the project config in one save", () => {
		const result = writeConfigKeys(
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

	it("preserves the keys the project config already has", () => {
		mockLoadProjectConfig.mockReturnValue({ commit: { push: true } });

		writeConfigKeys(
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

	it("writes to the current repo's block in the global config", () => {
		const result = writeConfigKeys(
			[{ key: "review.highLevel.uiPaths", value: ["src/ui/**"] }],
			"repo",
		);

		expect(result).toEqual({
			ok: true,
			target: "~/.assist.yml, repo: assist",
		});
		expect(mockSaveGlobalConfig).toHaveBeenCalledWith(
			{
				repos: {
					assist: {
						review: { highLevel: { uiPaths: ["src/ui/**"] } },
					},
				},
			},
			undefined,
		);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("saves nothing when any value fails validation", () => {
		const result = writeConfigKeys(
			[
				{ key: "review.highLevel.criticalPaths", value: ["**/*.graphql"] },
				{ key: "review.highLevel.descriptionWordCap", value: -1 },
			],
			"project",
		);

		expect(result.ok).toBe(false);
		expect(mockSaveConfig).not.toHaveBeenCalled();
	});

	it("refuses a global-only key", () => {
		const result = writeConfigKeys(
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
