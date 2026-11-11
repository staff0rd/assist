import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { resolveModel } from "./resolveModel";

describe("resolveModel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(loadConfig).mockReturnValue(
			makeAssistConfig({
				harness: {
					engine: "claude",
					defaults: {
						draft: { model: "fable" },
						design: { harness: "codex", model: "gpt-5" },
					},
				},
			}),
		);
	});

	it("returns an explicit model", () => {
		expect(resolveModel("opus", "draft", "codex")).toBe("opus");
	});

	it("returns no model for --no-model even when one is configured", () => {
		expect(resolveModel(false, "draft", "claude")).toBeUndefined();
	});

	it("uses the type's configured model on the type's harness", () => {
		expect(resolveModel(undefined, "draft", "claude")).toBe("fable");
		expect(resolveModel(undefined, "design", "codex")).toBe("gpt-5");
	});

	it("ignores the configured model on another harness", () => {
		expect(resolveModel(undefined, "draft", "codex")).toBeUndefined();
		expect(resolveModel(undefined, "design", "claude")).toBeUndefined();
	});

	it("returns no model when the type has none configured", () => {
		expect(resolveModel(undefined, "bug", "claude")).toBeUndefined();
	});
});
