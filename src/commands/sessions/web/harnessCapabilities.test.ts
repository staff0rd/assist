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

function run(): [ServerResponse, number, { exposeCodexActions: boolean }] {
	const res = {} as ServerResponse;
	harnessCapabilities({} as never, res);
	return mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		{ exposeCodexActions: boolean },
	];
}

describe("harnessCapabilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({ harness: {} });
	});

	it("exposes codex actions when codex is on PATH and not forced off", () => {
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body).toEqual({ exposeCodexActions: true });
		expect(mockIsHarnessAvailable).toHaveBeenCalledWith("codex");
	});

	it("hides codex actions when codex is not detected", () => {
		mockIsHarnessAvailable.mockReturnValue(false);
		const [, , body] = run();
		expect(body).toEqual({ exposeCodexActions: false });
	});

	it("hides codex actions when exposeCodexActions is forced off, without probing PATH", () => {
		mockLoadConfig.mockReturnValue({
			harness: { exposeCodexActions: false },
		});
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body).toEqual({ exposeCodexActions: false });
		expect(mockIsHarnessAvailable).not.toHaveBeenCalled();
	});
});
