// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { selectHighLevelSlice } from "../selectHighLevelSlice";
import type { HighLevelArea } from "./highLevelAreaCheck";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { useHighLevelReviewNav } from "./useHighLevelReviewNav";

function entry(
	areas: HighLevelArea[],
	disabled: HighLevelArea[] = [],
): HighLevelReviewEntry {
	return {
		additions: 0,
		deletions: 0,
		areas,
		disabled: new Set(disabled),
		counts: {},
		failures: {},
	};
}

const SLICE: HighLevelArea[] = ["structure", "tests", "critical"];
const entries = [
	entry(["description", "checks", "all"]),
	entry(SLICE),
	entry(SLICE),
];
const head = { repo: "owner/repo", prNumber: 7, headSha: "abc" };

function renderNav(list = entries, at = head) {
	return renderHook(() => useHighLevelReviewNav(list, at));
}

afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.restoreAllMocks();
});

describe("useHighLevelReviewNav", () => {
	it("restores the slice and tab after a remount", () => {
		const first = renderNav();
		act(() => first.result.current.pick(2));
		act(() => first.result.current.pickArea("tests"));
		first.unmount();

		const { result } = renderNav();
		expect(result.current.index).toBe(2);
		expect(result.current.area).toBe("tests");
	});

	it("starts at the first slice for a different head SHA", () => {
		const first = renderNav();
		act(() => first.result.current.pick(2));
		first.unmount();

		const { result } = renderNav(entries, { ...head, headSha: "def" });
		expect(result.current.index).toBe(0);
		expect(result.current.area).toBe("description");
	});

	it("clamps a saved index beyond the slice count", () => {
		const first = renderNav();
		act(() => first.result.current.pick(2));
		act(() => first.result.current.pickArea("critical"));
		first.unmount();

		const { result } = renderNav(entries.slice(0, 2));
		expect(result.current.index).toBe(1);
		expect(result.current.area).toBe("critical");
	});

	it("lands on the first open tab when the saved tab is now disabled", () => {
		const first = renderNav();
		act(() => first.result.current.pick(1));
		act(() => first.result.current.pickArea("structure"));
		first.unmount();

		const { result } = renderNav([
			entries[0],
			entry(SLICE, ["structure"]),
			entries[2],
		]);
		expect(result.current.index).toBe(1);
		expect(result.current.area).toBe("tests");
	});

	it("jumps to the structure tab of a selected slice over a restored position", () => {
		const first = renderNav();
		act(() => first.result.current.pick(1));
		act(() => first.result.current.pickArea("tests"));
		first.unmount();

		const { result } = renderNav();
		act(() => selectHighLevelSlice(2));
		expect(result.current.index).toBe(2);
		expect(result.current.area).toBe("structure");
	});

	it("keeps working when localStorage throws", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("denied");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("denied");
		});
		const { result } = renderNav();
		expect(result.current.index).toBe(0);
		act(() => result.current.pick(2));
		expect(result.current.index).toBe(2);
		expect(result.current.area).toBe("structure");
	});
});
