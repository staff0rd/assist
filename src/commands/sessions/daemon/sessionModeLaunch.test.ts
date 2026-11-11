import { describe, expect, it, vi } from "vitest";
import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { fakeHarnessMock } from "../../../test/mocks/fakeHarnessMock";
import { daemonLog } from "./daemonLog";
import { sessionModeLaunch } from "./sessionModeLaunch";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../../shared/harnessAdapters/detectHarness", () => ({
	detectHarness: () => ({ supported: true }),
}));
vi.mock("./designSystemPromptPath", () => ({
	designSystemPromptPath: () => "/pkg/agent/design-system-prompt.md",
}));

const DESIGN = {
	appendSystemPromptFile: "/pkg/agent/design-system-prompt.md",
	auto: true,
};

describe("sessionModeLaunch", () => {
	it.each([
		["claude", harnessAdapter("claude")],
		["fake", fakeHarnessMock()],
	])("appends the design prompt on %s", (_kind, adapter) => {
		expect(sessionModeLaunch(adapter, { design: true })).toEqual(DESIGN);
	});

	it("passes auto through for a plain session", () => {
		expect(sessionModeLaunch(harnessAdapter("codex"), { auto: true })).toEqual({
			auto: true,
		});
	});

	it.each([
		["pi", "pi"],
		["codex", "Codex"],
	] as const)(
		"launches without the design prompt and logs why on %s",
		(kind, label) => {
			expect(sessionModeLaunch(harnessAdapter(kind), { design: true })).toEqual(
				{
					auto: undefined,
				},
			);
			expect(vi.mocked(daemonLog)).toHaveBeenCalledWith(
				expect.stringContaining(`Design mode is unavailable on ${label}`),
			);
		},
	);
});
