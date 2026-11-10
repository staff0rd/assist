import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessesModule from "../../../shared/harnesses";
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

vi.mock("../../../shared/harnesses", async () => ({
	...(await vi.importActual<typeof harnessesModule>(
		"../../../shared/harnesses",
	)),
	isHarnessAvailable: (kind: string) => mockIsHarnessAvailable(kind),
}));

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { harnessCapabilities } from "./harnessCapabilities";

type Resolution = {
	available: boolean;
	reasons?: { capability: string; reason: string; remediation: string }[];
};
type Body = {
	exposeCodexActions: boolean;
	exposePiActions: boolean;
	engine: string;
	features: Record<string, Record<string, Resolution>>;
};

function run(): [ServerResponse, number, Body] {
	const res = {} as ServerResponse;
	harnessCapabilities({ headers: {} } as never, res);
	return mockRespondJson.mock.lastCall as [ServerResponse, number, Body];
}

describe("harnessCapabilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue(makeAssistConfig({ harness: {} }));
	});

	it("resolves Refine available on every detected harness", () => {
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body.exposeCodexActions).toBe(true);
		expect(body.exposePiActions).toBe(true);
		expect(body.engine).toBe("claude");
		expect(body.features.refine).toEqual({
			claude: { available: true },
			codex: { available: true },
			pi: { available: true },
		});
	});

	it("probes each harness once however many features resolve", () => {
		mockIsHarnessAvailable.mockReturnValue(true);
		run();
		expect(mockIsHarnessAvailable).toHaveBeenCalledTimes(3);
	});

	it("resolves Refine unavailable with the detection reason when a harness is not on PATH", () => {
		mockIsHarnessAvailable.mockImplementation((kind) => kind !== "codex");
		const [, , body] = run();
		expect(body.exposeCodexActions).toBe(false);
		const codex = body.features.refine.codex;
		expect(codex.available).toBe(false);
		expect(codex.reasons?.[0]).toMatchObject({
			capability: "harness.detected",
			reason: expect.stringContaining("`codex` is not on PATH"),
		});
	});

	it("resolves codex unavailable from the off switch, without probing codex", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { exposeCodexActions: false } }),
		);
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body.exposeCodexActions).toBe(false);
		expect(body.features.refine.codex).toEqual({
			available: false,
			reasons: [
				{
					capability: "harness.enabled",
					reason: "harness.exposeCodexActions is false",
					remediation: "assist config set harness.exposeCodexActions true",
				},
			],
		});
		expect(mockIsHarnessAvailable).not.toHaveBeenCalledWith("codex");
	});

	it("resolves pi unavailable from the off switch, without probing pi", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { exposePiActions: false } }),
		);
		mockIsHarnessAvailable.mockReturnValue(true);
		const [, , body] = run();
		expect(body.exposePiActions).toBe(false);
		expect(body.features.refine.pi.available).toBe(false);
		expect(mockIsHarnessAvailable).not.toHaveBeenCalledWith("pi");
	});

	it("reports the configured engine", () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ harness: { engine: "codex" } }),
		);
		mockIsHarnessAvailable.mockReturnValue(true);
		expect(run()[2].engine).toBe("codex");
	});
});
