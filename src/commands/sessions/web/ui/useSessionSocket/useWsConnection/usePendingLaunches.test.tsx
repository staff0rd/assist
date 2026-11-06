// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NewLaunchInput, ResolvedLaunch } from "../../PendingLaunch";
import { usePendingLaunches } from "./usePendingLaunches";

function resolveAfter(...launches: NewLaunchInput[]) {
	const { result } = renderHook(() => usePendingLaunches());
	act(() => {
		for (const launch of launches) result.current.addPendingLaunch(launch);
	});
	let resolved: ResolvedLaunch | undefined;
	act(() => {
		resolved = result.current.resolvePendingLaunch();
	});
	return { resolved, remaining: result.current.pendingLaunches };
}

describe("usePendingLaunches", () => {
	it("returns the resolved launch's title so the toast can name it", () => {
		const { resolved, remaining } = resolveAfter({
			title: "a775 — Keep",
			named: true,
		});

		expect(resolved).toEqual({ title: "a775 — Keep", open: false });
		expect(remaining).toEqual([]);
	});

	it("returns no title for an unnamed launch", () => {
		const { resolved } = resolveAfter({ title: "New session" });

		expect(resolved?.title).toBeUndefined();
	});

	it("resolves the oldest launch first", () => {
		const { resolved, remaining } = resolveAfter(
			{ title: "first", named: true },
			{ title: "second", named: true },
		);

		expect(resolved?.title).toBe("first");
		expect(remaining.map((l) => l.title)).toEqual(["second"]);
	});

	it("returns no title when nothing is launching", () => {
		const { resolved } = resolveAfter();

		expect(resolved).toEqual({ title: undefined, open: false });
	});

	it("reports a launch marked open so the new session can be focused", () => {
		const { resolved } = resolveAfter({ title: "New session", open: true });

		expect(resolved?.open).toBe(true);
	});
});
