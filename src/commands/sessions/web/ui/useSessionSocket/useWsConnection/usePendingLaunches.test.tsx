// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePendingLaunches } from "./usePendingLaunches";

describe("usePendingLaunches", () => {
	it("returns the resolved launch's title so the toast can name it", () => {
		const { result } = renderHook(() => usePendingLaunches());

		act(() =>
			result.current.addPendingLaunch({ title: "a775 — Keep", named: true }),
		);
		expect(result.current.pendingLaunches).toHaveLength(1);

		let resolved: string | undefined;
		act(() => {
			resolved = result.current.resolvePendingLaunch();
		});

		expect(resolved).toBe("a775 — Keep");
		expect(result.current.pendingLaunches).toEqual([]);
	});

	it("returns no title for an unnamed launch", () => {
		const { result } = renderHook(() => usePendingLaunches());

		act(() => result.current.addPendingLaunch({ title: "New session" }));

		let resolved: string | undefined = "unset";
		act(() => {
			resolved = result.current.resolvePendingLaunch();
		});

		expect(resolved).toBeUndefined();
	});

	it("resolves the oldest launch first", () => {
		const { result } = renderHook(() => usePendingLaunches());

		act(() => {
			result.current.addPendingLaunch({ title: "first", named: true });
			result.current.addPendingLaunch({ title: "second", named: true });
		});

		let resolved: string | undefined;
		act(() => {
			resolved = result.current.resolvePendingLaunch();
		});

		expect(resolved).toBe("first");
		expect(result.current.pendingLaunches.map((l) => l.title)).toEqual([
			"second",
		]);
	});

	it("returns no title when nothing is launching", () => {
		const { result } = renderHook(() => usePendingLaunches());

		let resolved: string | undefined = "unset";
		act(() => {
			resolved = result.current.resolvePendingLaunch();
		});

		expect(resolved).toBeUndefined();
	});
});
