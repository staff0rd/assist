// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "./types";
import { RUN_SETTLE_MS, useInitialized } from "./useInitialized";

function session(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "1",
		name: "s",
		commandType: "run",
		status: "running",
		startedAt: 100,
		...overrides,
	};
}

describe("useInitialized", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("settles a respawned run session that emits no further output", () => {
		const { result } = renderHook(() => useInitialized());
		act(() => {
			result.current.syncSessions([session({})]);
			result.current.markInitialized("1");
		});

		act(() => result.current.syncSessions([session({ startedAt: 200 })]));
		expect(result.current.initialized.has("1")).toBe(false);

		act(() => vi.advanceTimersByTime(RUN_SETTLE_MS));
		expect(result.current.initialized.has("1")).toBe(true);
	});

	it("leaves a respawned claude session starting until it prints", () => {
		const { result } = renderHook(() => useInitialized());
		act(() => {
			result.current.syncSessions([session({ commandType: "claude" })]);
			result.current.markInitialized("1");
		});

		act(() =>
			result.current.syncSessions([
				session({ commandType: "claude", startedAt: 200 }),
			]),
		);
		act(() => vi.advanceTimersByTime(RUN_SETTLE_MS));
		expect(result.current.initialized.has("1")).toBe(false);
	});
});
