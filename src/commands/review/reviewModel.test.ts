import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { loadConfig } from "../../shared/loadConfig";
import { reviewerLabel } from "./reviewerLabel";
import { reviewModel } from "./reviewModel";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockLoadConfig = vi.mocked(loadConfig);

function withCodexModel(codexModel: string | undefined): void {
	mockLoadConfig.mockReturnValue(makeAssistConfig({ review: { codexModel } }));
}

describe("reviewModel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses review.codexModel for the codex reviewer and labels it", () => {
		withCodexModel("gpt-5-codex");

		expect(reviewModel("codex")).toBe("gpt-5-codex");
		expect(reviewerLabel("codex", reviewModel("codex"))).toBe(
			"codex (gpt-5-codex)",
		);
	});

	it.each([
		["codex-default", "codex-default"],
		["empty", ""],
		["unset", undefined],
	])(
		"gives the codex reviewer no model when review.codexModel is %s",
		(_name, value) => {
			withCodexModel(value);

			expect(reviewModel("codex")).toBeUndefined();
			expect(reviewerLabel("codex", reviewModel("codex"))).toBe("codex");
		},
	);

	it("gives other harnesses no model", () => {
		withCodexModel("gpt-5-codex");

		expect(reviewModel("claude")).toBeUndefined();
	});
});
