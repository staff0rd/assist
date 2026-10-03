import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import {
	type AssistConfigInput,
	makeAssistConfig,
} from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { buildCodexModelArgs } from "./buildCodexModelArgs";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadConfig = vi.mocked(loadConfig);

describe("buildCodexModelArgs", () => {
	function withConfig(config: AssistConfigInput): void {
		mockLoadConfig.mockReturnValue(makeAssistConfig(config));
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should build the provider override and key env when the model and proxy are configured", () => {
		withConfig({
			review: { codexModel: "gpt-5-codex" },
			litellm: { baseUrl: "https://proxy.example/", apiKey: "sk-test" },
		});

		expect(buildCodexModelArgs()).toEqual({
			args: [
				"-c",
				"model_providers.litellm.name=LiteLLM",
				"-c",
				"model_providers.litellm.base_url=https://proxy.example/v1",
				"-c",
				"model_providers.litellm.env_key=ASSIST_LITELLM_API_KEY",
				"-c",
				"model_providers.litellm.wire_api=responses",
				"-c",
				"model_provider=litellm",
				"-m",
				"gpt-5-codex",
			],
			env: { ASSIST_LITELLM_API_KEY: "sk-test" },
			model: "gpt-5-codex",
		});
	});

	it("should keep the API key out of the arguments", () => {
		withConfig({
			review: { codexModel: "gpt-5-codex" },
			litellm: { baseUrl: "https://proxy.example", apiKey: "sk-test" },
		});

		expect(buildCodexModelArgs().args.join(" ")).not.toContain("sk-test");
	});

	it("should return nothing when the model is unset", () => {
		withConfig({
			litellm: { baseUrl: "https://proxy.example", apiKey: "sk-test" },
		});

		expect(buildCodexModelArgs()).toEqual({ args: [], env: {} });
	});

	it("should ignore harness.codexModel", () => {
		withConfig({
			harness: { engine: "claude", codexModel: "gpt-5-codex" },
			litellm: { baseUrl: "https://proxy.example", apiKey: "sk-test" },
		});

		expect(buildCodexModelArgs()).toEqual({ args: [], env: {} });
	});

	it("should return nothing when the proxy is not configured", () => {
		withConfig({ review: { codexModel: "gpt-5-codex" } });

		expect(buildCodexModelArgs()).toEqual({ args: [], env: {} });
	});

	it("should return nothing when only the API key is missing", () => {
		withConfig({
			review: { codexModel: "gpt-5-codex" },
			litellm: { baseUrl: "https://proxy.example" },
		});

		expect(buildCodexModelArgs()).toEqual({ args: [], env: {} });
	});
});
