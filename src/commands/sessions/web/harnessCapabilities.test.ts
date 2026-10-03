import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../../shared/loadConfig";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";

const mockLoadConfig = vi.mocked(loadConfig);
const mockIsHarnessAvailable = vi.fn();
const mockRespondJson = vi.fn();

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../../../shared/harnesses", () => ({
	isHarnessAvailable: (kind: string) => mockIsHarnessAvailable(kind),
}));

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { harnessCapabilities } from "./harnessCapabilities";

type Body = { exposeCodexActions: boolean; exposePiActions: boolean };

function run(): [ServerResponse, number, Body] {
	const res = {} as ServerResponse;
	harnessCapabilities({} as never, res);
	return mockRespondJson.mock.lastCall as [ServerResponse, number, Body];
}

describe("harnessCapabilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue(makeAssistConfig({ harness: {} }));
	});

	it("exposes codex and pi actions when both are on PATH and not forced off", () => {
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body).toEqual({ exposeCodexActions: true, exposePiActions: true });
		expect(mockIsHarnessAvailable).toHaveBeenCalledWith("codex");
		expect(mockIsHarnessAvailable).toHaveBeenCalledWith("pi");
	});

	it("hides actions for harnesses that are not detected", () => {
		mockIsHarnessAvailable.mockReturnValue(false);
		const [, , body] = run();
		expect(body).toEqual({ exposeCodexActions: false, exposePiActions: false });
	});

	it("hides codex actions when exposeCodexActions is forced off, without probing codex", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { exposeCodexActions: false } }),
		);
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body.exposeCodexActions).toBe(false);
		expect(mockIsHarnessAvailable).not.toHaveBeenCalledWith("codex");
	});

	it("hides pi actions when exposePiActions is forced off, without probing pi", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { exposePiActions: false } }),
		);
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body.exposePiActions).toBe(false);
		expect(mockIsHarnessAvailable).not.toHaveBeenCalledWith("pi");
	});
});
