// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeBacklogItemSummary } from "../../../../test/mothers/makeBacklogItemSummary";
import { backlogItemsCache } from "./backlogItemsCache";
import type { BacklogFilter } from "../parseBacklogFilter";
import type { BacklogItemSummary } from "./types";

const loadBacklogItems = vi.fn();
let cwd: string | undefined;
let filter: BacklogFilter;

vi.mock("./loadBacklogItems", () => ({
	loadBacklogItems: (...args: unknown[]) => loadBacklogItems(...args),
}));
vi.mock("./useRepoCwd", () => ({ useRepoCwd: () => cwd }));
vi.mock("./useBacklogFilter", () => ({
	useBacklogFilter: () => [filter, vi.fn()] as const,
}));

import { useBacklogItems } from "./useBacklogItems";

function resolveLoad(items: BacklogItemSummary[]) {
	loadBacklogItems.mockResolvedValue(items);
}

beforeEach(() => {
	cwd = "/repo";
	filter = "todo";
	loadBacklogItems.mockReset();
});

afterEach(() => {
	vi.clearAllMocks();
});

describe("useBacklogItems", () => {
	it("shows the spinner on a true first load (cache miss)", async () => {
		// No cache entry for this cwd yet.
		cwd = "/fresh";
		resolveLoad([makeBacklogItemSummary({ id: 1 })]);

		const { result } = renderHook(() => useBacklogItems());

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.items).toEqual([makeBacklogItemSummary({ id: 1 })]);
	});

	it("renders cached items immediately with no spinner, then revalidates silently", async () => {
		backlogItemsCache.set("/repo", "todo", [makeBacklogItemSummary({ id: 1 })]);
		resolveLoad([
			makeBacklogItemSummary({ id: 1 }),
			makeBacklogItemSummary({ id: 2 }),
		]);

		const { result } = renderHook(() => useBacklogItems());

		// Cache hit: items present and no spinner from the very first render.
		expect(result.current.loading).toBe(false);
		expect(result.current.items).toEqual([makeBacklogItemSummary({ id: 1 })]);

		// Background revalidation updates the list without ever flipping loading.
		await waitFor(() =>
			expect(result.current.items).toEqual([
				makeBacklogItemSummary({ id: 1 }),
				makeBacklogItemSummary({ id: 2 }),
			]),
		);
		expect(result.current.loading).toBe(false);
	});

	it("keeps the same items reference when revalidation finds no change", async () => {
		backlogItemsCache.set("/repo", "todo", [makeBacklogItemSummary({ id: 1 })]);
		resolveLoad([makeBacklogItemSummary({ id: 1 })]);

		const { result } = renderHook(() => useBacklogItems());
		const before = result.current.items;

		await waitFor(() => expect(loadBacklogItems).toHaveBeenCalled());
		// Give the revalidation microtask a chance to commit.
		await act(async () => {});

		expect(result.current.items).toBe(before);
	});

	it("shows the spinner when switching to an uncached cwd", async () => {
		backlogItemsCache.set("/repo", "todo", [makeBacklogItemSummary({ id: 1 })]);
		resolveLoad([makeBacklogItemSummary({ id: 1 })]);

		const { result, rerender } = renderHook(() => useBacklogItems());
		await waitFor(() => expect(result.current.loading).toBe(false));

		cwd = "/uncached";
		resolveLoad([makeBacklogItemSummary({ id: 9 })]);
		rerender();

		expect(result.current.loading).toBe(true);
		expect(result.current.items).toEqual([]);
		await waitFor(() =>
			expect(result.current.items).toEqual([makeBacklogItemSummary({ id: 9 })]),
		);
		expect(result.current.loading).toBe(false);
	});

	it("picks up a cross-machine status change via background polling without remount", async () => {
		vi.useFakeTimers();
		try {
			backlogItemsCache.set("/repo", "todo", [
				makeBacklogItemSummary({ id: 1 }),
			]);
			resolveLoad([makeBacklogItemSummary({ id: 1 })]);

			const { result } = renderHook(() => useBacklogItems());
			await act(async () => {
				await vi.advanceTimersByTimeAsync(0);
			});
			expect(result.current.items).toEqual([makeBacklogItemSummary({ id: 1 })]);

			resolveLoad([makeBacklogItemSummary({ id: 1, status: "in-progress" })]);
			await act(async () => {
				await vi.advanceTimersByTimeAsync(5000);
			});

			expect(result.current.items).toEqual([
				makeBacklogItemSummary({ id: 1, status: "in-progress" }),
			]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("re-seeds from the matching cache entry when the filter changes", async () => {
		backlogItemsCache.set("/repo", "todo", [makeBacklogItemSummary({ id: 1 })]);
		backlogItemsCache.set("/repo", "done", [
			makeBacklogItemSummary({ id: 2, status: "done" }),
		]);
		resolveLoad([makeBacklogItemSummary({ id: 1 })]);

		const { result, rerender } = renderHook(() => useBacklogItems());
		expect(result.current.items).toEqual([makeBacklogItemSummary({ id: 1 })]);

		filter = "done";
		resolveLoad([makeBacklogItemSummary({ id: 2, status: "done" })]);
		rerender();

		expect(result.current.loading).toBe(false);
		expect(result.current.items).toEqual([
			makeBacklogItemSummary({ id: 2, status: "done" }),
		]);
	});
});
