// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RUN_SETTLE_MS, useInitialized } from "./useInitialized";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";

describe("useInitialized", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("settles a respawned run session that emits no further output", () => {
		const { result } = renderHook(() => useInitialized());
		act(() => {
			result.current.syncSessions([
				makeSessionInfo({ id: "1", commandType: "run", startedAt: 100 }),
			]);
			result.current.markInitialized("1");
		});

		act(() =>
			result.current.syncSessions([
				makeSessionInfo({ id: "1", commandType: "run", startedAt: 200 }),
			]),
		);
		expect(result.current.initialized.has("1")).toBe(false);

		act(() => vi.advanceTimersByTime(RUN_SETTLE_MS));
		expect(result.current.initialized.has("1")).toBe(true);
	});

	it("leaves a respawned claude session starting until it prints", () => {
		const { result } = renderHook(() => useInitialized());
		act(() => {
			result.current.syncSessions([
				makeSessionInfo({ id: "1", commandType: "claude", startedAt: 100 }),
			]);
			result.current.markInitialized("1");
		});

		act(() =>
			result.current.syncSessions([
				makeSessionInfo({ id: "1", commandType: "claude", startedAt: 200 }),
			]),
		);
		act(() => vi.advanceTimersByTime(RUN_SETTLE_MS));
		expect(result.current.initialized.has("1")).toBe(false);
	});
});
