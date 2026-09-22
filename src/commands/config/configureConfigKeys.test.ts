import { beforeEach, describe, expect, it, vi } from "vitest";
import { configureConfigKeys } from "./configureConfigKeys";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();
const mockPromptInput = vi.fn<() => Promise<string>>();
const mockPromptConfigScope = vi.fn<() => Promise<"project" | "repo">>();

vi.mock("../../shared/loadConfig", () => ({
	loadProjectConfig: () => mockLoadProjectConfig(),
	loadGlobalConfigRaw: () => ({}),
	saveConfig: (config: unknown) => mockSaveConfig(config),
	saveGlobalConfig: vi.fn(),
}));

vi.mock("../../shared/promptInput", () => ({
	promptInput: () => mockPromptInput(),
}));

vi.mock("./promptConfigScope", () => ({
	promptConfigScope: () => mockPromptConfigScope(),
}));

const questions = [
	{
		key: "review.highLevel.criticalPaths",
		question: "Critical paths",
		suggest: "**/*.graphql",
	},
	{ key: "review.highLevel.descriptionWordCap", question: "Word cap" },
];

describe("configureConfigKeys", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockPromptConfigScope.mockResolvedValue("project");
	});

	it("answers from the supplied answers without prompting", async () => {
		const result = await configureConfigKeys(questions, {
			scope: "project",
			answers: {
				"review.highLevel.criticalPaths": "**/*.graphql, src/schema/**",
				"review.highLevel.descriptionWordCap": "250",
			},
		});

		expect(mockPromptInput).not.toHaveBeenCalled();
		expect(mockPromptConfigScope).not.toHaveBeenCalled();
		expect(result.written).toEqual([
			{
				key: "review.highLevel.criticalPaths",
				value: ["**/*.graphql", "src/schema/**"],
			},
			{ key: "review.highLevel.descriptionWordCap", value: 250 },
		]);
		expect(mockSaveConfig).toHaveBeenCalledWith({
			review: {
				highLevel: {
					criticalPaths: ["**/*.graphql", "src/schema/**"],
					descriptionWordCap: 250,
				},
			},
		});
	});

	it("prompts for the keys the caller did not answer", async () => {
		mockPromptInput.mockResolvedValue("400");

		const result = await configureConfigKeys(questions, {
			scope: "project",
			answers: { "review.highLevel.criticalPaths": "**/*.graphql" },
		});

		expect(mockPromptInput).toHaveBeenCalledTimes(1);
		expect(result.written).toContainEqual({
			key: "review.highLevel.descriptionWordCap",
			value: 400,
		});
	});

	it("leaves a key unset when its answer is blank", async () => {
		mockPromptInput.mockResolvedValue("  ");

		const result = await configureConfigKeys(questions, {
			scope: "project",
			answers: { "review.highLevel.criticalPaths": "" },
		});

		expect(result.skipped).toEqual([
			"review.highLevel.criticalPaths",
			"review.highLevel.descriptionWordCap",
		]);
		expect(mockSaveConfig).toHaveBeenCalledWith({});
	});

	it("asks which scope to write to when the caller names none", async () => {
		mockPromptConfigScope.mockResolvedValue("project");

		const result = await configureConfigKeys(questions, {
			answers: {
				"review.highLevel.criticalPaths": "**/*.graphql",
				"review.highLevel.descriptionWordCap": "250",
			},
		});

		expect(mockPromptConfigScope).toHaveBeenCalled();
		expect(result.scope).toBe("project");
		expect(result.target).toBe("project assist.yml");
	});
});
