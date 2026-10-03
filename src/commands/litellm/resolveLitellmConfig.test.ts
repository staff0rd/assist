import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import type { AssistConfig } from "../../shared/types";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

const mockLoadConfig = vi.mocked(loadConfig);

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { resolveLitellmConfig } from "./resolveLitellmConfig";

describe("resolveLitellmConfig", () => {
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	function withLitellm(litellm: AssistConfig["litellm"]): void {
		mockLoadConfig.mockReturnValue(makeAssistConfig({ litellm }));
	}

	function errored(): string {
		return errorSpy.mock.calls
			.map((call: unknown[]) => String(call[0]))
			.join("\n");
	}

	beforeEach(() => {
		vi.clearAllMocks();
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`exit:${code}`);
		}) as never);
	});

	afterEach(() => {
		errorSpy.mockRestore();
		exitSpy.mockRestore();
	});

	it("should return both values with a trailing slash trimmed from the base URL", () => {
		withLitellm({ baseUrl: "https://proxy.example/", apiKey: "sk-test" });

		expect(resolveLitellmConfig()).toEqual({
			baseUrl: "https://proxy.example",
			apiKey: "sk-test",
		});
	});

	it("should name the setter for each missing key", () => {
		withLitellm(undefined);

		expect(() => resolveLitellmConfig()).toThrow("exit:1");
		expect(errored()).toContain("LiteLLM is not configured");
		expect(errored()).toContain("assist config set litellm.baseUrl");
		expect(errored()).toContain("assist config set litellm.apiKey");
	});

	it("should name only the missing key", () => {
		withLitellm({ baseUrl: "https://proxy.example" });

		expect(() => resolveLitellmConfig()).toThrow("exit:1");
		expect(errored()).toContain("assist config set litellm.apiKey");
		expect(errored()).not.toContain("assist config set litellm.baseUrl");
	});
});
