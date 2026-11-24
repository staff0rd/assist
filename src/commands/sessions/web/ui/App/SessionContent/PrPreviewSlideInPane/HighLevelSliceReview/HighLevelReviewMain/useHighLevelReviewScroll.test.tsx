// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HighLevelArea } from "../highLevelAreaCheck";
import type { HighLevelReviewEntry } from "../highLevelReviewEntries";
import { useHighLevelReviewNav } from "../useHighLevelReviewNav";
import { useHighLevelReviewScroll } from "./useHighLevelReviewScroll";

function entry(areas: HighLevelArea[]): HighLevelReviewEntry {
	return {
		additions: 0,
		deletions: 0,
		areas,
		disabled: new Set(),
		counts: {},
		failures: {},
	};
}

const SLICE: HighLevelArea[] = ["structure", "tests", "critical"];
const entries = [entry(SLICE), entry(SLICE)];
const head = { repo: "owner/repo", prNumber: 7, headSha: "abc" };

let main: HTMLDivElement;

function renderScroll() {
	const mainRef = { current: main };
	const contentRef = { current: null };
	return renderHook(() => {
		const nav = useHighLevelReviewNav(entries, head);
		useHighLevelReviewScroll(mainRef, contentRef, nav);
		return nav;
	});
}

function userScroll(top: number) {
	main.scrollTop = top;
	main.dispatchEvent(new Event("scroll"));
}

beforeEach(() => {
	vi.useFakeTimers();
	main = document.createElement("div");
	let top = 0;
	Object.defineProperty(main, "scrollTop", {
		get: () => top,
		set: (next: number) => {
			top = next;
		},
	});
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.useRealTimers();
});

describe("useHighLevelReviewScroll", () => {
	it("restores the scroll offset after a remount", () => {
		const first = renderScroll();
		act(() => first.result.current.pick(1));
		act(() => first.result.current.pickArea("tests"));
		userScroll(320);
		vi.advanceTimersByTime(500);
		first.unmount();
		main.scrollTop = 0;

		renderScroll();
		expect(main.scrollTop).toBe(320);
	});

	it("saves a scroll still pending when the pane closes", () => {
		const first = renderScroll();
		userScroll(150);
		first.unmount();
		main.scrollTop = 0;

		renderScroll();
		expect(main.scrollTop).toBe(150);
	});

	it("scrolls to the top when the slice or tab changes after mount", () => {
		const first = renderScroll();
		userScroll(320);
		first.unmount();

		const { result } = renderScroll();
		expect(main.scrollTop).toBe(320);
		act(() => result.current.pickArea("tests"));
		expect(main.scrollTop).toBe(0);
		userScroll(200);
		act(() => result.current.pick(1));
		expect(main.scrollTop).toBe(0);
	});

	it("does not restore an offset saved for another tab", () => {
		const first = renderScroll();
		userScroll(320);
		vi.advanceTimersByTime(500);
		act(() => first.result.current.pickArea("tests"));
		first.unmount();
		main.scrollTop = 50;

		renderScroll();
		expect(main.scrollTop).toBe(0);
	});
});
