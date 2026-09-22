import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeConfigKeys } from "./writeConfigKeys";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockLoadGlobalConfigRaw = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();
const mockGetCurrentOrigin = vi.fn<() => string>();

vi.mock("../../shared/loadConfig", () => ({
	loadProjectConfig: () => mockLoadProjectConfig(),
	loadGlobalConfigRaw: () => mockLoadGlobalConfigRaw(),
	saveConfig: (config: unknown) => mockSaveConfig(config),
	saveGlobalConfig: (config: unknown) => mockSaveGlobalConfig(config),
}));

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
		expect(mockSaveConfig).toHaveBeenCalledWith({
			review: {
				highLevel: {
					criticalPaths: ["**/*.graphql"],
					descriptionWordCap: 250,
				},
			},
		});
	});

	it("preserves the keys the project config already has", () => {
		mockLoadProjectConfig.mockReturnValue({ commit: { push: true } });

		writeConfigKeys(
			[{ key: "review.highLevel.uiPaths", value: ["src/ui/**"] }],
			"project",
		);

		expect(mockSaveConfig).toHaveBeenCalledWith({
			commit: { push: true },
			review: { highLevel: { uiPaths: ["src/ui/**"] } },
		});
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
		expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
			repos: {
				assist: {
					review: { highLevel: { uiPaths: ["src/ui/**"] } },
				},
			},
		});
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
