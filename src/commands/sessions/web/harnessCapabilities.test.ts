import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();
const mockIsHarnessAvailable = vi.fn();
const mockRespondJson = vi.fn();

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

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
		mockLoadConfig.mockReturnValue({ harness: {} });
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
		mockLoadConfig.mockReturnValue({
			harness: { exposeCodexActions: false },
		});
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body.exposeCodexActions).toBe(false);
		expect(mockIsHarnessAvailable).not.toHaveBeenCalledWith("codex");
	});

	it("hides pi actions when exposePiActions is forced off, without probing pi", () => {
		mockLoadConfig.mockReturnValue({
			harness: { exposePiActions: false },
		});
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body.exposePiActions).toBe(false);
		expect(mockIsHarnessAvailable).not.toHaveBeenCalledWith("pi");
	});
});
