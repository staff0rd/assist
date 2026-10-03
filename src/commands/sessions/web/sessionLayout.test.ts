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

import { sessionLayout } from "./sessionLayout";

type Body = { topBar: boolean };

function run(): [ServerResponse, number, Body] {
	const res = {} as ServerResponse;
	sessionLayout({} as never, res);
	return mockRespondJson.mock.lastCall as [ServerResponse, number, Body];
}

describe("sessionLayout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue(makeAssistConfig({ sessions: {} }));
	});

	it("reports the top bar on when sessions.topBar is set", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sessions: { topBar: true } }),
		);
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body).toEqual({ topBar: true });
	});

	it("reports the top bar off when sessions.topBar is false", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ sessions: { topBar: false } }),
		);
		const [, , body] = run();
		expect(body).toEqual({ topBar: false });
	});

	it("defaults the top bar on when the key is absent", () => {
		const [, , body] = run();
		expect(body).toEqual({ topBar: true });
	});

	it("defaults the top bar on when there is no sessions config at all", () => {
		mockLoadConfig.mockReturnValue(makeAssistConfig());
		const [, , body] = run();
		expect(body).toEqual({ topBar: true });
	});
});
