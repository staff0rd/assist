import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../../shared/loadConfig";
import { makeAssistConfig } from "../../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../../test/mocks/loadConfigMock";

const mockLoadConfig = vi.mocked(loadConfig);
const mockRespondJson = vi.fn();

vi.mock("../../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { newsNavConfig } from "./newsNavConfig";

type Body = { showInNav: boolean };

function run(): [ServerResponse, number, Body] {
	const res = {} as ServerResponse;
	newsNavConfig({} as never, res);
	return mockRespondJson.mock.lastCall as [ServerResponse, number, Body];
}

describe("newsNavConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue(makeAssistConfig());
	});

	it("reports showInNav on when news.showInNav is set", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ news: { showInNav: true } }),
		);
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body).toEqual({ showInNav: true });
	});

	it("defaults showInNav off when there is no news config", () => {
		const [, , body] = run();
		expect(body).toEqual({ showInNav: false });
	});
});
