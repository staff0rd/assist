// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HarnessCapabilities } from "../../parseHarnessCapabilities";
import { usePhoneHarness } from "./usePhoneHarness";

let capabilities: HarnessCapabilities;

vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: () => capabilities,
}));

function withBuild(
	runHarness: HarnessCapabilities["runHarness"],
	available: Record<string, boolean>,
): HarnessCapabilities {
	const build = Object.fromEntries(
		Object.entries(available).map(([kind, ok]) => [kind, { available: ok }]),
	);
	return {
		exposeCodexActions: true,
		exposePiActions: false,
		engine: "claude",
		runHarness,
		features: { build },
	};
}

describe("usePhoneHarness", () => {
	beforeEach(() => {
		capabilities = withBuild("codex", { claude: true, codex: true });
	});

	it("preselects the run harness and leaves it to the CLI default", () => {
		const { result } = renderHook(() => usePhoneHarness());
		expect(result.current.harness).toBe("codex");
		expect(result.current.harnessArgs).toEqual([]);
	});

	it("passes --harness when the engine is picked over the run harness", () => {
		const { result } = renderHook(() => usePhoneHarness());
		act(() => result.current.setHarness("claude"));
		expect(result.current.harness).toBe("claude");
		expect(result.current.harnessArgs).toEqual(["--harness", "claude"]);
	});

	it("passes the fallback harness when the run harness is unavailable", () => {
		capabilities = withBuild("codex", { claude: true, codex: false });
		const { result } = renderHook(() => usePhoneHarness());
		expect(result.current.harness).toBe("claude");
		expect(result.current.harnessArgs).toEqual(["--harness", "claude"]);
	});
});
